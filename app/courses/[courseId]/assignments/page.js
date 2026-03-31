"use client";
import { useRole } from '../../../components/RoleProvider';
import { PenTool, Calendar, Plus } from 'lucide-react';

export default function Assignments() {
  const { role } = useRole();
  const isTeacher = role === 'teacher';

  const assignments = [
    { title: "Drafting an Apology Email", due: "Sep 15 at 11:59pm", pts: "20 pts", status: "Published" },
    { title: "Client Escalation Case Study", due: "Sep 22 at 11:59pm", pts: "50 pts", status: "Published" },
    { title: "Midterm: Live Negotiation", due: "Oct 10 at 1:00pm", pts: "100 pts", status: "Draft" }
  ];

  return (
    <div style={{ maxWidth: '900px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Assignments</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Business Communication (COM 301)</p>
        </div>
        {isTeacher && (
           <div className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: 'black' }}>
              <Plus size={18}/> New Assignment
           </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
         <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
            <div>ASSIGNMENT TITLE</div>
            <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between' }}>
               <span>DUE DATE</span>
               <span>SCORE</span>
            </div>
         </div>
         {assignments.map((a, i) => {
            // Hide drafts from students entirely
            if (!isTeacher && a.status === 'Draft') return null;

            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: i === assignments.length - 1 ? 'none' : '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                      <PenTool color="var(--primary)" size={20} />
                   </div>
                   <div>
                     <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {a.title}
                        {isTeacher && a.status === 'Draft' && <span style={{ background: 'rgba(255, 255, 255, 0.1)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px' }}>DRAFT</span>}
                     </div>
                     <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Business Comm Unit {i+1}</div>
                   </div>
                </div>
                <div style={{ width: '250px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14}/> {a.due}
                   </div>
                   <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.pts}</div>
                </div>
              </div>
            )
         })}
      </div>
    </div>
  );
}
