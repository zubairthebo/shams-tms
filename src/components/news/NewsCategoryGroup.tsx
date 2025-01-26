import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsListItem } from "./NewsListItem";
import type { NewsItem } from "@/types";

interface NewsCategoryGroupProps {
  categoryName: string;
  items: NewsItem[];
  editingId: string | null;
  editText: string;
  onEditChange: (text: string) => void;
  onStartEdit: (item: NewsItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  canManageCategory: (category: string) => boolean;
  language: string;
}

export const NewsCategoryGroup = ({
  categoryName,
  items,
  editingId,
  editText,
  onEditChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  canManageCategory,
  language
}: NewsCategoryGroupProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{categoryName}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <NewsListItem
              key={item.id}
              item={item}
              isEditing={editingId === item.id}
              editText={editText}
              onEditChange={onEditChange}
              onStartEdit={() => onStartEdit(item)}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onDelete={() => onDelete(item.id)}
              canManage={canManageCategory(item.category)}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};