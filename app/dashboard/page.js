'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selections, setSelections] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('student_session');
    if (!session) return router.push('/');
    const parsed = JSON.parse(session);
    setStudent(parsed);
    fetchAvailableCourses(parsed);
  }, []);

  const fetchAvailableCourses = async (profile) => {
    const res = await fetch(`/api/subjects?course=${profile.course}&year=${profile.year}&semester=${profile.semester}&studentId=${profile.id}`);
    const data = await res.json();
    if (res.ok) {
      setSubjects(data.subjects);
      if (data.existingSelections.length > 0) {
        setSubmitted(true);
        const mapped = {};
        data.existingSelections.forEach(s => { mapped[s.categorySlot] = s.subjectId; });
        setSelections(mapped);
      }
    }
  };

  const handleDropdownUpdate = (slot, value) => {
    setSelections(prev => ({ ...prev, [slot]: value }));
  };

  const handleFreezeSubmission = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    const rawIds = Object.values(selections).filter(Boolean).map(Number);

    // Enforce home department validation constraints
    const matchedSubjects = subjects.filter(sub => rawIds.includes(sub.id));
    const normalizedCourseName = student.course.toUpperCase();
    
    for (const sub of matchedSubjects) {
      if (sub.type === 'GE' && sub.department && normalizedCourseName.includes(sub.department)) {
        return setStatusMessage(`❌ Prohibited Choice: You cannot select a Generic Elective from your home department (${sub.department})[cite: 4].`);
      }
    }

    // Cross-reference structural validation metrics depending on student year
    if (student.year === 4) {
      if (rawIds.length !== 3) return setStatusMessage("❌ Year 4 requirements state you must select exactly 3 options total.");
      const geCount = matchedSubjects.filter(s => s.type === 'GE').length;
      if (geCount > 2) return setStatusMessage("❌ Year 4 bounds validation constraint: Maximum permitted GE selection count is 2.");
    } else {
      const activeCategoryCounters = ['GE', 'DSE', 'SEC', 'VAC'].filter(type => subjects.some(s => s.type === type));
      if (rawIds.length !== activeCategoryCounters.length) {
        return setStatusMessage("❌ Input profile mismatch: Please ensure a selection is made for every parameter box slot.");
      }
    }

    // Verify unique choices array
    if (new Set(rawIds).size !== rawIds.length) {
      return setStatusMessage("❌ Selection duplication exception: Each selected elective selection must be a completely distinct paper.");
    }

    const payload = Object.keys(selections).map(slot => ({ categorySlot: slot, subjectId: selections[slot] }));

    const res = await fetch('/api/select-subject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student.id, selectionsPayload: payload })
    });

    const responseData = await res.json();
    if (res.ok) {
      setSubmitted(true);
      setStatusMessage("✅ Elective selection options successfully frozen!");
      fetchAvailableCourses(student);
    } else {
      setStatusMessage(`❌ Transaction error: ${responseData.error}`);
    }
  };

  if (!student) return <div style={{ padding: '3rem', textAlign: 'center', fontWeight: 'bold' }}>Syncing profile metadata...</div>;

  const standardGE = subjects.filter(s => s.type === 'GE');
  const standardDSE = subjects.filter(s => s.type === 'DSE');
  const standardSEC = subjects.filter(s => s.type === 'SEC');
  const standardVAC = subjects.filter(s => s.type === 'VAC');
  const combinationPoolY4 = subjects.filter(s => s.type === 'GE' || s.type === 'DSE');

  const createSelectorBox = (slotKey, labelName, listPool) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '1.2rem' }}>
      <label style={{ fontWeight: '600', color: '#374151' }}>{labelName}</label>
      <select disabled={submitted} value={selections[slotKey] || ''} onChange={e => handleDropdownUpdate(slotKey, e.target.value)} required style={{ padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', backgroundColor: submitted ? '#f1f5f9' : 'white' }}>
        <option value="">-- Choose Available Option --</option>
        {listPool.map(sub => {
          const isFull = sub._count?.selections >= sub.maxCapacity;
          return (
            <option key={sub.id} value={sub.id} disabled={isFull && selections[slotKey] !== sub.id} style={{ color: isFull ? '#94a3b8' : 'black' }}>
              {sub.name} ({sub.type}) {isFull ? ' [🚫 SUBJECT FULL]' : ` (${sub._count?.selections || 0}/${sub.maxCapacity} Allocated)`}
            </option>
          );
        })}
      </select>
    </div>
  );

  return (
    <div style={{ maxWidth: '700px', margin: '4rem auto', padding: '2.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e3a8a' }}>Allocation Panel</h2>
          <p style={{ margin: '4px 0 0 0', color: '#4b5563' }}>Identity: <strong>{student.name}</strong> ({student.rollNumber})</p>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/'); }} style={{ background: '#dc2626', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
      </div>

      <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#1e40af' }}>
        <strong>Stream:</strong> {student.course} | <strong>Mapping parameters:</strong> Year {student.year}, Semester {student.semester}
      </div>

      {statusMessage && (
        <div style={{ padding: '1rem', borderRadius: '6px', fontWeight: 'bold', marginBottom: '1.5rem', background: statusMessage.includes('✅') ? '#d1fae5' : '#fee2e2', color: statusMessage.includes('✅') ? '#065f46' : '#991b1b' }}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleFreezeSubmission}>
        {student.year === 4 ? (
          <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef3c7', marginBottom: '1.5rem' }}>
            <p style={{ margin: '0 0 1rem 0', color: '#b45309', fontSize: '0.88rem', fontWeight: '500' }}>
              <strong>🎓 4th Year Mix-and-Match Mode Active:</strong> Choose exactly 3 courses across the combined DSE/GE options pool. Permitted metrics: (1 GE + 2 DSE), (2 GE + 1 DSE), or (0 GE + 3 DSE).
            </p>
            {createSelectorBox('choice_0', 'Elective Priority Selection 1', combinationPoolY4)}
            {createSelectorBox('choice_1', 'Elective Priority Selection 2', combinationPoolY4)}
            {createSelectorBox('choice_2', 'Elective Priority Selection 3', combinationPoolY4)}
          </div>
        ) : (
          <>
            {standardGE.length > 0 && createSelectorBox('GE', 'Generic Elective Paper (GE)', standardGE)}
            {standardDSE.length > 0 && createSelectorBox('DSE', 'Discipline Specific Elective Paper (DSE)', standardDSE)}
            {standardSEC.length > 0 && createSelectorBox('SEC', 'Skill Enhancement Paper (SEC)', standardSEC)}
            {standardVAC.length > 0 && createSelectorBox('VAC', 'Value Addition Paper (VAC)', standardVAC)}
          </>
        )}

        {!submitted ? (
          <button type="submit" style={{ width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.15)' }}>
            Freeze Account Selections
          </button>
        ) : (
          <div style={{ padding: '1rem', border: '2px dashed #cbd5e1', color: '#64748b', textAlign: 'center', background: '#f8fafc', fontWeight: 'bold', borderRadius: '6px' }}>
            🔒 Registry entries locked for this profile.
          </div>
        )}
      </form>
    </div>
  );
}