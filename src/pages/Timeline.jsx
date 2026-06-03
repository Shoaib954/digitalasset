import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiTimeLine, RiAddCircleLine, RiFlowChart, RiCheckboxCircleLine, RiLoader4Line } from 'react-icons/ri';
import { getTimeline } from '../services/api';

const typeColors = {
  creation: 'var(--accent-gold)',
  stage: 'var(--accent-teal)',
  default: 'var(--accent-blue)',
};

const stageBadge = {
  completed: 'badge-success',
  pending: 'badge-warning',
  triggered: 'badge-danger',
  active: 'badge-success',
  draft: 'badge-neutral',
};

const Timeline = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimeline()
      .then((res) => setEvents(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="animate-fade-in loading-container">
      <div className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Timeline</h1>
          <p className="page-subtitle">History of your inheritance plan activities</p>
        </div>
      </div>

      {events.length > 0 ? (
        <motion.div
          className="glass-card-static"
          style={{ padding: '28px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="timeline">
            {events.map((event, i) => {
              const color = typeColors[event.type] || typeColors.default;
              return (
                <motion.div
                  key={i}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="timeline-dot" style={{ borderColor: color, background: 'var(--bg-card)' }}>
                    {event.type === 'creation' ? <RiAddCircleLine style={{ fontSize: '0.7rem', color }} /> : <RiCheckboxCircleLine style={{ fontSize: '0.7rem', color }} />}
                  </div>
                  <div className="timeline-date">
                    {event.date ? new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <div className="timeline-title">{event.event}</div>
                    {event.status && <span className={`badge ${stageBadge[event.status] || 'badge-neutral'}`} style={{ fontSize: '0.68rem' }}>{event.status}</span>}
                  </div>
                  <div className="timeline-desc" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RiFlowChart style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }} />
                    {event.planName}
                    {event.notes && <span style={{ color: 'var(--text-muted)' }}>— {event.notes}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="empty-state glass-card-static">
          <div className="empty-state-icon"><RiTimeLine /></div>
          <h3 className="empty-state-title">No Timeline Events</h3>
          <p className="empty-state-text">Create inheritance plans to see their history here.</p>
        </div>
      )}
    </div>
  );
};

export default Timeline;
