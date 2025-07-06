export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return '#gray';
    case 'in_progress':
      return '#blue';
    case 'completed':
      return '#green';
    case 'failed':
      return '#red';
    default:
      return '#gray';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return '#gray';
    case 'medium':
      return '#yellow';
    case 'high':
      return '#red';
    default:
      return '#gray';
  }
};
