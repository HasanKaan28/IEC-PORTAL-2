"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  User,
  Paperclip,
  Send,
  Trash2,
  FolderGit2,
  Flame,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  TaskItem,
  TaskCommentItem,
  TaskAttachmentItem,
  TaskStatus,
  TaskPriority,
} from "@/lib/tasks/task-types";
import {
  updateTaskStatusAction,
  updateTaskPriorityAction,
  assignTaskAction,
  addTaskCommentAction,
  deleteTaskAction,
  getTaskCommentsAction,
  getTaskAttachmentsAction,
} from "@/lib/tasks/task-actions";

interface TaskDetailDrawerProps {
  task: TaskItem | null;
  onClose: () => void;
  onTaskUpdated: (updatedTask: TaskItem) => void;
  onTaskDeleted: (taskId: string) => void;
  members: Array<{ id: string; name: string; role: string; avatar?: string }>;
}

export default function TaskDetailDrawer({
  task,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  members,
}: TaskDetailDrawerProps) {
  const [comments, setComments] = useState<TaskCommentItem[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      getTaskCommentsAction(task.id).then(setComments);
      getTaskAttachmentsAction(task.id).then(setAttachments);
    }
  }, [task?.id]);

  if (!task) return null;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus };
    onTaskUpdated(updated);
    await updateTaskStatusAction(task.id, newStatus);
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    const updated = { ...task, priority: newPriority };
    onTaskUpdated(updated);
    await updateTaskPriorityAction(task.id, newPriority);
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    const assignedMember = members.find((m) => m.id === newAssigneeId);
    const updated = {
      ...task,
      assigneeId: newAssigneeId,
      assigneeName: assignedMember?.name || "Atanmamış",
      assigneeAvatar: assignedMember?.avatar || null,
      assigneeRole: assignedMember?.role || "Üye",
    };
    onTaskUpdated(updated);
    await assignTaskAction(task.id, newAssigneeId);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const res = await addTaskCommentAction(task.id, newComment);
    setIsSubmitting(false);

    if (res.success && res.comment) {
      setComments((prev) => [...prev, res.comment!]);
      setNewComment("");
      onTaskUpdated({
        ...task,
        commentsCount: (task.commentsCount || 0) + 1,
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu görevi silmek istediğinize emin misiniz?")) return;
    setIsDeleting(true);
    await deleteTaskAction(task.id);
    setIsDeleting(false);
    onTaskDeleted(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 font-semibold">
                {task.id}
              </span>
              {task.projectName && (
                <span className="text-xs text-slate-500 font-medium">
                  {task.projectName}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-900 font-display leading-snug">
            {task.title}
          </h2>
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 space-y-6 overflow-y-auto">
          {/* Quick Selectors Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                DURUM
              </span>
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as TaskStatus)
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-brand-600 cursor-pointer"
              >
                <option value="todo">Yapılacak</option>
                <option value="in_progress">Devam Ediyor</option>
                <option value="in_review">İncelemede</option>
                <option value="done">Tamamlandı</option>
              </select>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                ÖNCELİK
              </span>
              <select
                value={task.priority}
                onChange={(e) =>
                  handlePriorityChange(e.target.value as TaskPriority)
                }
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-brand-600 cursor-pointer"
              >
                <option value="urgent">Acil</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">
                SORUMLU
              </span>
              <select
                value={task.assigneeId || ""}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-medium text-slate-800 focus:outline-none focus:border-brand-600 cursor-pointer truncate"
              >
                <option value="">Atanmamış</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Açıklama & Yönergeler
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
              {task.description || "Açıklama belirtilmemiş."}
            </p>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Ekli Dosyalar ({attachments.length})</span>
              </h3>
              <div className="space-y-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">
                        {att.fileName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({Math.round(att.fileSize / 1024)} KB)
                      </span>
                    </div>
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:underline shrink-0 ml-2"
                    >
                      İndir
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Thread */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Görev Tartışması ({comments.length})
            </h3>

            {/* List */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs font-mono">
                  Henüz bir güncelleme veya yorum yazılmamış.
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {comment.userName}
                        </span>
                        <span className="text-[10px] font-mono text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                          {comment.userRole}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Görevle ilgili teknik ilerleme veya soru yazın..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-brand-600 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmitting ? "Gönderiliyor..." : "Yorum Ekle"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium p-2 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Görevi Sil</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
