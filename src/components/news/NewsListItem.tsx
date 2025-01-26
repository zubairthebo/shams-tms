import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit2, Check, X } from "lucide-react";
import type { NewsItem } from "@/types";

interface NewsListItemProps {
  item: NewsItem;
  isEditing: boolean;
  editText: string;
  onEditChange: (text: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  canManage: boolean;
}

export const NewsListItem = ({
  item,
  isEditing,
  editText,
  onEditChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  canManage
}: NewsListItemProps) => {
  return (
    <li className="flex items-center justify-between p-2 border-b last:border-0">
      {isEditing ? (
        <div className="flex items-center space-x-2 flex-1">
          <Input
            value={editText}
            onChange={(e) => onEditChange(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onSaveEdit}
            className="text-green-500 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelEdit}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <>
          <span>{item.text}</span>
          {canManage && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onStartEdit}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </li>
  );
};