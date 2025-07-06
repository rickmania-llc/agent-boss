import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { createWorkItem } from '../../../store/actions/workItems.actions';
import './CreateWorkItem.css';

function CreateWorkItem() {
  const dispatch = useDispatch<AppDispatch>();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        createWorkItem({
          ...formData,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      );
      setFormData({ title: '', description: '', priority: 'medium' });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create work item:', error);
    }
  };

  if (!isOpen) {
    return (
      <button className="create-work-item-button" onClick={() => setIsOpen(true)}>
        Create Work Item
      </button>
    );
  }

  return (
    <div className="create-work-item-modal">
      <div className="create-work-item-content">
        <h3>Create Work Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
            <button type="submit">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateWorkItem;
