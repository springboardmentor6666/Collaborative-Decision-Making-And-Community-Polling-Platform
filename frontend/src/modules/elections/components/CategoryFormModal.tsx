import React, { useState } from 'react';
import { useCreateCategory, useUpdateCategory } from '../hooks/useElections';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { VotingCategory } from '../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  existingCategory?: VotingCategory;
}

export function CategoryFormModal({ isOpen, onClose, eventId, existingCategory }: CategoryFormModalProps) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  
  const [name, setName] = useState(existingCategory?.name || '');
  const [description, setDescription] = useState(existingCategory?.description || '');
  const [maxSelections, setMaxSelections] = useState(existingCategory?.maxSelections?.toString() || '1');

  // Update local state when existingCategory changes
  React.useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setDescription(existingCategory.description);
      setMaxSelections(existingCategory.maxSelections.toString());
    } else {
      setName('');
      setDescription('');
      setMaxSelections('1');
    }
  }, [existingCategory, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !maxSelections) {
      toast.error('Please fill out all fields.');
      return;
    }

    const data = {
      name,
      description,
      maxSelections: parseInt(maxSelections, 10),
    };

    if (existingCategory) {
      updateMutation.mutate({
        eventId,
        categoryId: existingCategory.categoryId,
        data,
      }, {
        onSuccess: () => {
          toast.success('Category updated successfully!');
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to update category.');
        }
      });
    } else {
      createMutation.mutate({
        eventId,
        data,
      }, {
        onSuccess: () => {
          toast.success('Category created successfully!');
          setName('');
          setDescription('');
          setMaxSelections('1');
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to create category.');
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{existingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {existingCategory ? 'Update category details.' : 'Add a new category to this election.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Best Developer" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this category..." required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Max Selections</label>
            <Input type="number" min="1" value={maxSelections} onChange={(e) => setMaxSelections(e.target.value)} required />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
