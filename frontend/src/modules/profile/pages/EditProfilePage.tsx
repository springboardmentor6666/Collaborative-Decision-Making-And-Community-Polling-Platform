import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Camera, Upload, Trash2 } from 'lucide-react';
import { fileApi } from '@/api/fileApi';
import { useAuth } from '@/context/AuthContext';
import { ImageCropperModal } from '@/components/common/ImageCropperModal';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useProfile();
  const { updateUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    profileImage: '',
    bio: ''
  });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeviceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, GIF)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image size exceeds 15MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsUploadingAvatar(true);
    try {
      const file = new File([croppedBlob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const result = await fileApi.uploadProfileImage(file);
      setFormData(prev => ({ ...prev, profileImage: result.fileUrl }));
      if (user) {
        updateUser({ ...user, profileImage: result.fileUrl });
      }
      refetch();
      toast.success('Profile avatar cropped and updated successfully!');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to upload cropped avatar';
      toast.error(errMsg);
    } finally {
      setIsUploadingAvatar(false);
      setIsCropModalOpen(false);
      setCropImageSrc(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateProfileMutation.mutateAsync(formData);
      updateUser(updated);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="bg-card border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground">Edit Profile</CardTitle>
          <CardDescription className="text-muted-foreground">Update your personal information and public profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Avatar with Device Upload */}
            <div className="space-y-3">
              <Label className="text-foreground font-semibold text-sm">Profile Avatar</Label>
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border/70">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-border hover:border-blue-500 transition-all shrink-0"
                >
                  <Avatar className="w-full h-full">
                    {formData.profileImage && (
                      <AvatarImage src={formData.profileImage} alt={formData.fullName} className="object-cover" />
                    )}
                    <AvatarFallback className="text-xl font-bold bg-blue-600 text-white">
                      {(formData.fullName || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mb-1" />
                        <span>Change</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold h-8 gap-1.5 shadow-xs"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>Upload from Device</span>
                    </Button>

                    {formData.profileImage && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                        className="border-border text-xs font-semibold h-8 text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a high-resolution JPG, PNG, or WebP photo. Automatically cropped and optimized.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleDeviceImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground font-semibold">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                className="bg-background border-border text-foreground"
                required 
                minLength={2}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-semibold">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+1 (555) 000-0000"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-foreground font-semibold">Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us a little bit about yourself"
                className="min-h-[100px] bg-background border-border text-foreground"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-border">
              <Button type="button" variant="outline" className="border-border hover:bg-muted text-foreground" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Profile Image Cropping Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
        shape="circle"
        allowShapeSwitch={true}
        title="Crop Profile Avatar"
        description="Position and scale your picture to perfectly fit the circular profile avatar."
      />
    </div>
  );
}

