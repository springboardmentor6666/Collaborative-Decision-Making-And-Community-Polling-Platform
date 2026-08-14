import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCommunityApi } from '../api/axiosClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import IconSidebar from '../components/IconSidebar';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'PUBLIC'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Community name is required.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await createCommunityApi(formData, accessToken);
      // Ensure the backend returns the community id in response.id
      navigate(`/communities/${response?.id || ''}`);
    } catch (err) {
      setError(err.message || 'Failed to create community.');
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen flex flex-col sm:pr-[60px]">
      <Navbar />
      <IconSidebar />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-8">
            <div className="mb-6">
              <Link to="/communities" className="inline-flex items-center text-sm font-semibold text-muted transition hover:text-text-primary">
                <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Communities
              </Link>
            </div>

            <div className="rounded-3xl border border-border-default bg-surface p-6 shadow-sm md:p-8">
              <div className="mb-8 border-b border-border-default pb-6">
                <h1 className="text-3xl font-black text-text-primary tracking-tight">Create a Community</h1>
                <p className="mt-2 text-sm text-secondary">
                  Build a space for your group to discuss and make decisions together.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-bold text-text-primary">
                    Community Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full rounded-2xl border border-border-default bg-surface py-3 px-4 text-text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Design Team"
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-bold text-text-primary">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="block w-full rounded-2xl border border-border-default bg-surface py-3 px-4 text-text-primary placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="What is this community about?"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-bold text-text-primary">Visibility</label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label
                      className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none ${
                        formData.visibility === 'PUBLIC'
                          ? 'border-primary bg-primary-soft ring-1 ring-primary'
                          : 'border-border-default bg-surface hover:bg-surface-alt'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value="PUBLIC"
                        checked={formData.visibility === 'PUBLIC'}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="sr-only"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className={`block text-sm font-bold ${formData.visibility === 'PUBLIC' ? 'text-primary' : 'text-text-primary'}`}>
                            Public
                          </span>
                          <span className={`mt-1 block text-sm ${formData.visibility === 'PUBLIC' ? 'text-primary' : 'text-secondary'}`}>
                            Anyone can find and view this community.
                          </span>
                        </span>
                      </span>
                      <svg className={`h-5 w-5 ${formData.visibility === 'PUBLIC' ? 'text-primary' : 'invisible'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </label>

                    <label
                      className={`relative flex cursor-pointer rounded-2xl border p-4 focus:outline-none ${
                        formData.visibility === 'PRIVATE'
                          ? 'border-primary bg-primary-soft ring-1 ring-primary'
                          : 'border-border-default bg-surface hover:bg-surface-alt'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value="PRIVATE"
                        checked={formData.visibility === 'PRIVATE'}
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                        className="sr-only"
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className={`block text-sm font-bold ${formData.visibility === 'PRIVATE' ? 'text-primary' : 'text-text-primary'}`}>
                            Private
                          </span>
                          <span className={`mt-1 block text-sm ${formData.visibility === 'PRIVATE' ? 'text-primary' : 'text-secondary'}`}>
                            Only members can view this community.
                          </span>
                        </span>
                      </span>
                      <svg className={`h-5 w-5 ${formData.visibility === 'PRIVATE' ? 'text-primary' : 'invisible'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center rounded-2xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-app transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <svg className="mr-2 h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      'Create Community'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
