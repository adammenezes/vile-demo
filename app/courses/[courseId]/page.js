"use client";
import { useRole } from '../../components/RoleProvider';
import { Pencil } from 'lucide-react';

export default function CourseHome() {
  const { role } = useRole();
  const isTeacher = role === 'teacher';

  return (
    <div style={{ maxWidth: '900px', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Business Communication <span style={{fontSize:'1.25rem', color:'var(--muted-foreground)'}}>COM 301</span></h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Fall Semester 2026 • Prof. Rebecca Sullivan</p>
        </div>
        {isTeacher && (
           <div className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pencil size={16}/> Edit Syllabus
           </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>Course Overview</h2>
        <p style={{ lineHeight: 1.7, color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          Welcome to COM 301! In today's hyper-connected business landscape, the ability to communicate clearly, empathetically, and persuasively is paramount. This course will equip you with foundational skills to handle client escalations, internal advocacy, and professional rhetoric. 
        </p>
        <p style={{ lineHeight: 1.7, color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          <strong>New for Fall:</strong> We are pioneering the use of the <span style={{color: 'var(--primary)', fontWeight: 600}}>AI Study Assistant</span>. The AI has been securely granted access to my direct lecture notes and syllabus grading rubrics. You can consult it 24/7 for tailored feedback that aligns strictly with my teaching standards.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '3rem' }}>
           <div>
             <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem' }}>Learning Objectives</h3>
             <ul style={{ paddingLeft: '1.25rem', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
               <li>Master internal vs external email etiquette.</li>
               <li>Navigate conflict resolution effectively.</li>
               <li>Construct highly persuasive proposals.</li>
             </ul>
           </div>
           <div>
             <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem' }}>Grading Breakdown</h3>
             <ul style={{ paddingLeft: '1.25rem', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
               <li>Weekly Case Studies: 30%</li>
               <li>Midterm Practical: 30%</li>
               <li>Final Presentation: 40%</li>
             </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
