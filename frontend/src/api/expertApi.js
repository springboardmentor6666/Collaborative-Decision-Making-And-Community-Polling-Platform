/**
 * DecisionHub - Collaborative Decision-Making & Community Polling Platform
 *
 * File: expertApi.js
 * Architecture Tier: Service & API Layer
 * Path: frontend/src/api/expertApi.js
 *
 * Purpose:
 *   Handles expert application submission, status verification, document uploads,
 *   and administrative approval/rejection workflows.
 */

import { updateUserRoleAdminApi } from './axiosClient';

const STORAGE_KEY = 'dh_expert_applications';

export const EXPERT_DOMAINS = [
  'Technology & AI',
  'Economics, Finance & Markets',
  'Public Policy & Governance',
  'Healthcare, Medicine & Bioethics',
  'Urban Planning & Infrastructure',
  'Environmental Science & Climate',
  'Legal & Regulatory Compliance',
  'Community Safety & Social Impact',
];

export const EXPERIENCE_LEVELS = [
  '1-3 years (Junior Specialist)',
  '3-5 years (Mid-Level Practitioner)',
  '5-10 years (Senior Domain Expert)',
  '10+ years (Principal / Fellow / Executive)',
];

function getStoredApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredApplications(apps) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save expert applications', e);
  }
}

/**
 * Submit an expert verification application.
 */
export async function submitExpertApplicationApi({
  user,
  specialization,
  experienceYears,
  qualifications,
  portfolioUrl,
  documentName,
  documentDataUrl,
  documentSize,
}) {
  const apps = getStoredApplications();
  const existingIdx = apps.findIndex((a) => String(a.userId) === String(user.id) || a.userEmail === user.email);

  const newApp = {
    id: existingIdx >= 0 ? apps[existingIdx].id : `exp-${Date.now()}`,
    userId: user.id,
    userName: user.name || user.fullName || 'User',
    userEmail: user.email,
    userAvatar: user.avatar || user.profileImage || null,
    specialization,
    experienceYears,
    qualifications,
    portfolioUrl: portfolioUrl?.trim() || null,
    documentName: documentName || 'resume_certificate.pdf',
    documentDataUrl: documentDataUrl || null,
    documentSize: documentSize || '120 KB',
    status: 'PENDING', // PENDING, APPROVED, REJECTED
    appliedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: null,
  };

  if (existingIdx >= 0) {
    apps[existingIdx] = newApp;
  } else {
    apps.unshift(newApp);
  }

  saveStoredApplications(apps);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('decisionhub:refresh'));
  }

  return newApp;
}

/**
 * Get current user's expert application.
 */
export async function getMyExpertApplicationApi(user) {
  if (!user) return null;
  const apps = getStoredApplications();
  const found = apps.find(
    (a) => (user.id && String(a.userId) === String(user.id)) || (user.email && a.userEmail?.toLowerCase() === user.email.toLowerCase())
  );
  return found || null;
}

/**
 * Get all expert applications for Admin review.
 */
export async function getAllExpertApplicationsAdminApi() {
  const apps = getStoredApplications();
  return apps;
}

/**
 * Admin approves an expert application.
 */
export async function approveExpertApplicationAdminApi(appId, adminToken) {
  const apps = getStoredApplications();
  const target = apps.find((a) => a.id === appId);
  if (!target) throw new Error('Application not found');

  target.status = 'APPROVED';
  target.reviewedAt = new Date().toISOString();
  target.reviewNote = 'Approved by administrator after credentials verification.';
  saveStoredApplications(apps);

  // Promote user role to EXPERT in the backend database
  if (target.userId && adminToken) {
    try {
      await updateUserRoleAdminApi(target.userId, 'EXPERT', adminToken);
    } catch (err) {
      console.warn('Backend updateUserRoleAdminApi warning:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('decisionhub:refresh'));
  }

  return target;
}

/**
 * Admin rejects an expert application.
 */
export async function rejectExpertApplicationAdminApi(appId, reason) {
  const apps = getStoredApplications();
  const target = apps.find((a) => a.id === appId);
  if (!target) throw new Error('Application not found');

  target.status = 'REJECTED';
  target.reviewedAt = new Date().toISOString();
  target.reviewNote = reason || 'Documentation does not meet domain expert criteria.';
  saveStoredApplications(apps);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('decisionhub:refresh'));
  }

  return target;
}
