import React from 'react';
import { UserResponse } from '../../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Calendar, Mail, MapPin, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileCardProps {
  user: UserResponse;
  isCurrentUser?: boolean;
}

export function ProfileCard({ user, isCurrentUser = false }: ProfileCardProps) {
  const joinDate = user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Unknown';
  
  return (
    <Card className="overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <CardContent className="relative pt-0 sm:pt-0 pb-8 px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 mb-6 space-y-4 sm:space-y-0">
          <Avatar className="h-32 w-32 border-4 border-background bg-muted">
            <AvatarImage src={user.profileImage} alt={user.fullName} className="object-cover" />
            <AvatarFallback className="text-4xl">{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          {isCurrentUser && (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/profile/settings">Settings</Link>
              </Button>
              <Button asChild>
                <Link to="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-1 mb-6">
          <h2 className="text-2xl font-bold">{user.fullName}</h2>
          <p className="text-muted-foreground">@{user.username}</p>
        </div>
        
        {user.bio && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">About</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{user.bio}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {joinDate}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{user.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
