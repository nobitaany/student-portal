'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState({ GE: [], DSE: [], SEC: [], VAC: [] });
  const [chosenMap, setChosenMap] = useState({});
  const [feedback, setFeedback] = useState({ message: '', error: false });
  const router = useRouter();

  const fetchAcademicMatrix = useCallback(async (student) => {
    try {
      const res = await fetch(`/api/subjects?semester=${student.semester}&year=${student.year}&course=${encodeURIComponent(student.course)}&studentId=${student.id}`);
      const data = await res.json();
      if (res.ok) {
        const structuralGroups = { GE: [], DSE: [], SEC: [], VAC: [] };
        data.subjects.forEach(sub => {
          if (structuralGroups[sub.type]) structuralGroups[sub.type].push(sub);
        });
        setCategories(structuralGroups);

        const selectionMapping = {};
        data.selections.forEach(sel => {
          selectionMapping[sel.category] = sel.subjectId;
        });
        setChosenMap(selectionMapping);
      }
    } catch {
      setFeedback({ message: 'Error retrieving live academic options.', error: true });
    }
  }, []);

  useEffect(() => {
    const authenticatedSession = localStorage.getItem('student_session');
    if (!authenticatedSession) {
      router.push('/');
    } else {
      const studentData = JSON.parse(authenticatedSession);
      setUser(studentData);
      fetchAcademicMatrix(studentData);
    }
  }, [router, fetchAcademicMatrix]);

  const handleSeatAllocation = async (subjectId, category) => {
    setFeedback({ message: '', error: false });
    try {
      const response = await fetch('/api/select-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, subjectId, category })
      });
      const result = await response.json();

      if (response.ok) {
        setFeedback({ message: result.message, error: false });
        fetchAcademicMatrix(user);
      } else {
        setFeedback({ message: result.error, error: true });
      }
    } catch {
      setFeedback({ message: 'Network submission error.', error: true });
    }
  };

  if (!user) return <p className="p-8 text-center">Validating session...</p>;

  return (
    <main className="max-w-5xl mx-auto p-6 family-sans">
      <header className="border-b pb-4 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Academic Elective Portal</h1>
          <p className="text-sm text-gray-500">{user.course} — Semester {user.semester} (Year {user.year})</p>
        </div>
        <button onClick={() => { localStorage.clear(); router.push('/'); }} className="bg-red-50 text-red-600 px-4 py-2 rounded dynamic-trans hover:bg-red-100">Logout</button>
      </header>

      {feedback.message && (
        <div className={`p-4 mb-6 rounded text-sm ${feedback.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {feedback.message}
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(categories).map(([categoryName, items]) => {
          if (items.length === 0) return null;
          const processingChoiceId = chosenMap[categoryName];

          return (
            <section key={categoryName} className="bg-white rounded-lg border p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-blue-700 border-b pb-2">{categoryName} Category Block</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {items.map(subject => {
                  const isSelectedByMe = processingChoiceId === subject.id;
                  const isCategoryFilledByMe = !!processingChoiceId;
                  const isSubjectFull = subject.enrolledCount >= subject.maxCapacity;

                  return (
                    <div 
                      key={subject.id} 
                      className={`p-4 rounded-lg border flex justify-between items-center transition-all ${
                        isSelectedByMe ? 'border-green-500 bg-green-50/50' : isSubjectFull ? 'bg-gray-50 border-gray-200 opacity-60' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Status: {subject.enrolledCount} / {subject.maxCapacity} Seats Filled</p>
                      </div>

                      {isSelectedByMe ? (
                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded">Allocated</span>
                      ) : isSubjectFull ? (
                        <span className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded border border-red-200">Subject Full</span>
                      ) : (
                        <button
                          disabled={isCategoryFilledByMe}
                          onClick={() => handleSeatAllocation(subject.id, categoryName)}
                          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                            isCategoryFilledByMe 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Select Choice
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
