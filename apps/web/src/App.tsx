import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchLatestRoutine = async () => {
  const { data } = await axios.get('http://localhost:3001/api/routines/latest');
  return data;
};

function App() {
  const { data: routine, isLoading, isError } = useQuery({
    queryKey: ['latestRoutine'],
    queryFn: fetchLatestRoutine,
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>RepSync Dashboard 🏋️</h1>
      <p>Your local-first AI fitness coach.</p>

      <div style={{ marginTop: '40px', padding: '20px', borderRadius: '8px', background: '#f5f5f5', color: '#333' }}>
        <h2>Latest AI Routine</h2>
        {isLoading ? (
          <p>Loading coach's plan...</p>
        ) : isError ? (
          <p>Failed to connect to local API. Is Fastify running?</p>
        ) : routine ? (
          <div>
            <p><strong>Coach says:</strong> {routine.aiMessage}</p>
            <h3>Workout Plan:</h3>
            <ul>
              {routine.plannedExercises?.map((ex: any, i: number) => (
                <li key={i}>
                  {ex.targetSets}x{ex.targetReps} {ex.exerciseName} @ {ex.targetWeight}kg
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No routines generated yet. Tell Claude to build you one!</p>
        )}
      </div>
    </div>
  );
}

export default App;
