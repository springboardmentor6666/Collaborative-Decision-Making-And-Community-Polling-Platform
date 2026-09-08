import React, { useState } from 'react';
import { AbuseReportResponse } from '@/modules/decisions/api/abuseReportApi';
import { useResolveReport } from '@/modules/decisions/hooks/useAbuseReport';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  CheckCircle2, 
  ExternalLink, 
  UserMinus, 
  UserX, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  MessageSquare, 
  Layers, 
  Globe, 
  ShieldAlert
} from 'lucide-react';
import { ReportActionModal, UserActionType } from './ReportActionModal';
import { useConfirm } from '@/context/ConfirmDialogContext';
import { UserResponse } from '@/types';

interface ReportCardProps {
  report: AbuseReportResponse;
}

export function ReportCard({ report }: ReportCardProps) {
  const resolveMutation = useResolveReport();
  const { confirm } = useConfirm();
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [actionType, setActionType] = useState<UserActionType | null>(null);

  const isComment = !report.commentId ? false : true;
  const isCommunity = !report.decisionId && !report.commentId && !!report.communityId;
  const isDecision = !!report.decisionId && !report.commentId;

  const getTargetTypeName = () => {
    if (isComment) return 'Comment';
    if (isCommunity) return 'Community';
    return 'Decision';
  };

  const getReasonBadgeStyle = (reason: string) => {
    switch (reason) {
      case 'SCAM':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'SPAM':
        return 'bg-amber-600 text-white hover:bg-amber-700';
      case 'MISLEADING':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'HARASSMENT':
        return 'bg-purple-600 text-white hover:bg-purple-700';
      case 'ABUSE':
        return 'bg-rose-600 text-white hover:bg-rose-700';
      case 'RESTRICTED_ADULT':
        return 'bg-pink-700 text-white hover:bg-pink-800';
      default:
        return 'bg-slate-700 text-white hover:bg-slate-800';
    }
  };

  const handleResolve = async (deleteTarget: boolean) => {
    const targetType = getTargetTypeName();
    const targetName = targetType.toLowerCase();

    let highlightText: string | undefined = undefined;
    if (isDecision && report.decisionTitle) {
      highlightText = `Decision: "${report.decisionTitle}"`;
    } else if (isComment && report.commentMessage) {
      highlightText = `Comment: "${report.commentMessage}"`;
    } else if (isCommunity && report.communityName) {
      highlightText = `Community: "${report.communityName}"`;
    }

    const confirmed = await confirm(
      deleteTarget
        ? {
            title: `Remove ${targetType}`,
            message: `Are you sure you want to remove this ${targetName} and notify the author? This content will be permanently removed from the platform.`,
            confirmText: `Remove ${targetType}`,
            cancelText: 'Keep Content',
            variant: 'destructive',
            icon: 'trash',
            badgeText: 'Permanent Content Removal',
            highlightContent: highlightText,
          }
        : {
            title: 'Dismiss Abuse Report',
            message: `Are you sure you want to dismiss this report? The reported ${targetName} will remain active and the report will be marked as resolved with no violation.`,
            confirmText: 'Dismiss Report',
            cancelText: 'Cancel',
            variant: 'warning',
            icon: 'check',
            badgeText: 'Report Moderation',
            highlightContent: highlightText,
          }
    );

    if (confirmed) {
      try {
        await resolveMutation.mutateAsync({
          reportId: report.reportId,
          deleteDecision: deleteTarget,
        });
        toast.success(
          deleteTarget
            ? `${targetType} removed and author notified.`
            : 'Report dismissed successfully.'
        );
      } catch {
        toast.error('Failed to update report.');
      }
    }
  };

  const openUserAction = (type: UserActionType) => {
    if (report.targetAuthor) {
      setSelectedUser(report.targetAuthor);
      setActionType(type);
    }
  };

  const targetAuthor = report.targetAuthor;
  const isPending = report.status === 'PENDING';

  return (
    <Card className={`overflow-hidden border transition-all ${
      isPending ? 'border-slate-200 bg-white shadow-sm hover:border-slate-300' : 'border-slate-100 bg-slate-50/50 opacity-80'
    }`}>
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getReasonBadgeStyle(report.reason)} font-semibold text-xs px-2.5 py-0.5 shadow-none`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {report.reason}
            </Badge>

            <Badge variant="outline" className={`font-medium text-xs ${
              isComment ? 'border-purple-200 text-purple-700 bg-purple-50' : 
              isCommunity ? 'border-amber-200 text-amber-700 bg-amber-50' : 
              'border-blue-200 text-blue-700 bg-blue-50'
            }`}>
              {isComment && <MessageSquare className="w-3 h-3 mr-1" />}
              {isCommunity && <Globe className="w-3 h-3 mr-1" />}
              {isDecision && <Layers className="w-3 h-3 mr-1" />}
              {getTargetTypeName()} Report
            </Badge>

            <Badge variant="outline" className={`text-xs ${
              report.status === 'PENDING' ? 'border-amber-300 text-amber-800 bg-amber-50/80 font-bold' :
              report.status === 'RESOLVED' ? 'border-emerald-300 text-emerald-800 bg-emerald-50' :
              'border-slate-300 text-slate-700 bg-slate-100'
            }`}>
              {report.status}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Reported on {new Date(report.createdAt).toLocaleString(undefined, { 
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}</span>
          </div>
        </div>

        {/* Main Content Verification & Author Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Target Content Verification Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Reported Content Details</span>
              {isDecision && report.decisionId && (
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Link to={`/decisions/${report.decisionId}`} target="_blank" rel="noopener noreferrer">
                    Open Decision Board <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              )}
              {isCommunity && report.communityId && (
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Link to={`/communities/${report.communityId}`} target="_blank" rel="noopener noreferrer">
                    Open Community Page <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              )}
              {isComment && report.decisionId && (
                <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Link to={`/decisions/${report.decisionId}`} target="_blank" rel="noopener noreferrer">
                    View Discussion Context <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              {isDecision && (
                <>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {report.decisionTitle || `Decision Board #${report.decisionId}`}
                  </h3>
                  {report.decisionDescription && (
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {report.decisionDescription}
                    </p>
                  )}
                  {report.communityName && (
                    <div className="text-xs text-slate-500 pt-1">
                      Posted in community: <span className="font-semibold text-slate-700">{report.communityName}</span>
                    </div>
                  )}
                </>
              )}

              {isCommunity && (
                <>
                  <h3 className="font-bold text-base text-slate-900 leading-snug flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    {report.communityName || `Community #${report.communityId}`}
                  </h3>
                  {report.communityDescription && (
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {report.communityDescription}
                    </p>
                  )}
                </>
              )}

              {isComment && (
                <>
                  <div className="text-xs text-purple-700 font-semibold mb-1">
                    Reported Comment Content:
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-purple-100 text-slate-900 text-sm font-medium italic">
                    "{report.commentMessage || 'Comment text unavailable'}"
                  </div>
                  {report.decisionTitle && (
                    <div className="text-xs text-slate-500 pt-1">
                      Under decision: <span className="font-semibold text-slate-700">{report.decisionTitle}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Reporter Explanation */}
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/70 text-sm space-y-1">
              <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Reported by @{report.reportedBy?.username || 'user'}
                </span>
                <span className="text-amber-700/80 font-normal">
                  {report.reportedBy?.fullName || report.reportedBy?.email}
                </span>
              </div>
              <p className="text-amber-950 font-medium text-xs md:text-sm">
                "{report.description || 'No additional note provided by reporter.'}"
              </p>
            </div>
          </div>

          {/* Author Standing & Profile Column */}
          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Author / Creator Standing</span>
              {targetAuthor ? (
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200">
                      <AvatarImage src={targetAuthor.profileImage} />
                      <AvatarFallback className="bg-slate-100 font-bold text-slate-700">
                        {targetAuthor.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {targetAuthor.fullName || targetAuthor.username}
                      </div>
                      <div className="text-xs text-slate-500 truncate">@{targetAuthor.username}</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-slate-700 truncate max-w-[140px]">{targetAuthor.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Account Status:</span>
                      <Badge className={`text-[10px] px-1.5 py-0 uppercase font-bold shadow-none ${
                        targetAuthor.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        targetAuthor.accountStatus === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {targetAuthor.accountStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border text-xs text-muted-foreground text-center">
                  Author details unavailable or content deleted.
                </div>
              )}
            </div>

            {/* Resolved Status info if already processed */}
            {!isPending && report.resolvedBy && (
              <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 space-y-0.5">
                <div className="font-semibold text-slate-800">Resolved by Admin:</div>
                <div>@{report.resolvedBy.username} ({report.resolvedBy.fullName})</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls Bar */}
        {isPending && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* User Account Moderation Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {targetAuthor && (
                <>
                  {targetAuthor.accountStatus === 'ACTIVE' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-amber-700 border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-xs font-semibold"
                        onClick={() => openUserAction('SUSPEND')}
                      >
                        <UserMinus className="w-3.5 h-3.5 mr-1.5" />
                        Suspend Account
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-700 border-rose-300 bg-rose-50/50 hover:bg-rose-100 text-xs font-semibold"
                        onClick={() => openUserAction('DEACTIVATE')}
                      >
                        <UserX className="w-3.5 h-3.5 mr-1.5" />
                        Deactivate Account
                      </Button>
                    </>
                  )}
                  {targetAuthor.accountStatus !== 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-700 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 text-xs font-semibold"
                      onClick={() => openUserAction('REACTIVATE')}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                      Reactivate Account
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Content Moderation Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                onClick={() => handleResolve(false)}
                disabled={resolveMutation.isPending}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Dismiss Report
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="text-xs font-semibold shadow-sm"
                onClick={() => handleResolve(true)}
                disabled={resolveMutation.isPending}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Remove {getTargetTypeName()}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Account Action Dialog */}
      <ReportActionModal
        user={selectedUser}
        actionType={actionType}
        isOpen={!!actionType}
        onClose={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
      />
    </Card>
  );
}
