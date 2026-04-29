// src/pages/UploadNote.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Upload, X, Image, FileText, CheckCircle } from 'lucide-react';
import useAuthStore from '../context/AuthContext';
import * as z from 'zod';

const SUBJECTS = [
  'Mathematics', 'Programming', 'Physics',
  'Chemistry', 'Biology', 'History',
  'Economics', 'English', 'Other'
];

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  customSubject: z.string().optional(),
  college: z.string().min(1, 'College is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.string().optional()
});

function ImageDropZone({ label, hint, file, onFileChange, required = false }) {
  const [dragActive, setDragActive] = useState(false);
  const inputId = `img-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-gray-400 font-normal text-xs"> — {hint}</span>}
      </label>
      <div
        onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) onFileChange(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        className={`border-2 border-dashed rounded-xl transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-gray-200 hover:border-indigo-300'}`}
      >
        {file ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-44 object-cover" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <button type="button" onClick={() => onFileChange(null)}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                <X size={12} /> Remove
              </button>
            </div>
            {/* File info bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-1.5 flex items-center justify-between">
              <span className="text-white text-xs truncate max-w-[80%]">{file.name}</span>
              <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Image className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Drag & drop your image here</p>
            <p className="text-xs text-gray-400 mb-3">JPG, PNG or WEBP</p>
            <input type="file" accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => onFileChange(e.target.files[0] || null)}
              className="hidden" id={inputId} />
            <label htmlFor={inputId}
              className="cursor-pointer text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Browse Files
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UploadNote() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: { tags: '', description: '', subject: '', customSubject: '' }
  });

  const watchSubject = watch('subject');

  const addTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        const updated = [...tags, newTag];
        setTags(updated);
        setValue('tags', updated.join(', '));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    setValue('tags', updated.join(', '));
  };

  const onSubmit = async (data) => {
    if (!file) { setError('Note file is required'); return; }
    if (!coverImage) { setError('Cover image is required'); return; }
    if (!previewImage) { setError('Preview image is required'); return; }
    if (!token) { setError('Session expired. Please login again.'); return; }

    // ✅ Use custom subject if "Other" selected
    const finalSubject = data.subject === 'Other'
      ? (data.customSubject?.trim() || 'Other')
      : data.subject;

    setUploading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('subject', finalSubject);
    formData.append('college', data.college);
    formData.append('description', data.description);
    formData.append('tags', data.tags || '');
    formData.append('file', file);
    formData.append('coverImage', coverImage);
    formData.append('previewImage', previewImage);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/api/notes');
    xhr.setRequestHeader('x-auth-token', token);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 201) {
        reset(); setTags([]); setFile(null); setCoverImage(null); setPreviewImage(null);
        navigate('/notes');
      } else {
        try { setError(JSON.parse(xhr.responseText).msg || 'Upload failed'); }
        catch { setError('Upload failed'); }
      }
      setUploading(false);
    };
    xhr.onerror = () => { setError('Network error'); setUploading(false); };
    xhr.send(formData);
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please log in to upload notes.</p>
        <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">Log In</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/notes" className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Note</h1>
            <p className="text-sm text-gray-500">Share your knowledge with others</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Progress bar — only when uploading */}
          {uploading && (
            <div className="h-1 bg-gray-100">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">

              {/* ── Section: Basic Info ── */}
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Basic Info</h2>
                <div className="space-y-4">

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                      placeholder="e.g., Calculus Basics — Integration by Parts"
                      {...register('title')}
                    />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  {/* Subject + Custom Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm bg-white"
                      {...register('subject')}
                    >
                      <option value="">Select a subject</option>
                      {SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}

                    {/* ✅ Custom subject input — appears when "Other" selected */}
                    {watchSubject === 'Other' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-indigo-50"
                          placeholder="Type your subject name..."
                          {...register('customSubject')}
                          autoFocus
                        />
                        {errors.customSubject && (
                          <p className="mt-1 text-xs text-red-500">{errors.customSubject.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* College */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                      placeholder="e.g., Delhi University"
                      {...register('college')}
                    />
                    {errors.college && <p className="mt-1 text-xs text-red-500">{errors.college.message}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm resize-none"
                      placeholder="What will students learn from this note?"
                      {...register('description')}
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(optional)</span></label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <span key={tag} className="flex items-center bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-medium">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 hover:text-indigo-900">
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                      placeholder="Press Enter to add a tag (e.g., exam, formula)"
                      onKeyDown={addTag}
                    />
                    <input type="hidden" {...register('tags')} />
                  </div>
                </div>
              </div>

              {/* ── Section: Files ── */}
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Files</h2>
                <div className="space-y-5">

                  {/* Note File — styled differently since it's not an image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Note File <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal text-xs"> — PDF or Image, max 10MB</span>
                    </label>
                    <div
                      onDrop={(e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
                      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                      className={`border-2 border-dashed rounded-xl transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                    >
                      {file ? (
                        <div className="p-4 flex items-center gap-4">
                          {/* File icon */}
                          <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-7 h-7 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>
                          <button type="button" onClick={() => setFile(null)}
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 mb-1">Drag & drop your note file here</p>
                          <p className="text-xs text-gray-400 mb-4">PDF, JPG or PNG up to 10MB</p>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setFile(e.target.files[0] || null)}
                            className="hidden" id="file-upload" />
                          <label htmlFor="file-upload"
                            className="cursor-pointer text-sm bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                            Choose File
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover + Preview in 2 columns on md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageDropZone
                      label="Cover Image"
                      hint="shown on note cards"
                      required
                      file={coverImage}
                      onFileChange={setCoverImage}
                    />
                    <ImageDropZone
                      label="Preview Image"
                      hint="shown on note detail page"
                      required
                      file={previewImage}
                      onFileChange={setPreviewImage}
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <X size={15} className="text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={uploading || !file || !coverImage || !previewImage}
                className="w-full flex justify-center items-center gap-2 py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md text-sm"
              >
                {uploading ? (
                  <><Loader2 className="animate-spin w-4 h-4" /><span>Uploading {progress}%</span></>
                ) : (
                  <><Upload size={16} /><span>Upload Note</span></>
                )}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}