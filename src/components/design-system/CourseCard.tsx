import React from 'react';
import { ResourceCard } from './ResourceCard';
import { LearningResource } from '@/types/careerCompass';

interface CourseCardProps {
  course: LearningResource;
  onAction?: (course: LearningResource) => void;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onAction,
  className = '',
}) => {
  return (
    <ResourceCard
      resource={{ ...course, resourceType: 'Course' }}
      onAction={onAction}
      className={className}
    />
  );
};
