import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function EditProfilePage() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    profileImage: '',
    bio: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(formData);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information and public profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
                minLength={2}
                maxLength={100}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input 
                id="profileImage" 
                name="profileImage" 
                value={formData.profileImage} 
                onChange={handleChange} 
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-muted-foreground">Provide a direct link to an image to use as your avatar.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Tell us a little bit about yourself"
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
