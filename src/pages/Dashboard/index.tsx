import React, { useEffect, useRef, useState } from 'react';
import { Card, Grid, Button, Loader, Segment, Header, Form } from 'semantic-ui-react';
import TaskList from '../../components/TaskList';

const appName = 'lost-ark-check-list';

// UTC
const weeklyResetDay = 3; // Wednesday
const resetHours = 10;

import jsonData from '../../../template.json' assert { type: 'json' };

export default function App() {
  const [taskCompletionState, setTaskCompletionState] = useState({});
  const [loading, setLoading] = useState(true); // Track loading state
  const isInitialRender = useRef(true); // Track initial render
  const [checkResetTimer, setCheckResetTimer] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    // localStorage.clear();
    const loadState = () => {
      let savedState = {};
      try {
        const storedState = localStorage.getItem(`${appName}-taskCompletionState`);
        savedState = storedState ? JSON.parse(storedState) : {};
      } catch (error) {
        console.error("Failed to parse taskCompletionState from localStorage:", error);
      }
      const initialState = jsonData.reduce((acc, char) => {
        acc[char.name] = savedState[char.name] ||
          char.tasks.reduce((taskAcc, task) => {
            taskAcc[task] = false; // Initialize each task as false
            return taskAcc;
          }, {});
        return acc;
      }, {});

      setTaskCompletionState(initialState);
      setLoading(false); // Data loaded
    };

    loadState();
    setCheckResetTimer(true);
  }, []);

  useEffect(() => {
    if (checkResetTimer) {
      // const testDate = "2025-01-11T09:00:00Z";
      const currentDateTimeUTC = new Date();
      const lastCheckedDateStr = localStorage.getItem(`${appName}-lastCheckedDate`);
      const lastCheckedDate = lastCheckedDateStr ? new Date(lastCheckedDateStr) : null;
      const currentDateAtResetHour = new Date(currentDateTimeUTC);
      currentDateAtResetHour.setUTCHours(resetHours, 0, 0, 0); // Set the hour to the reset Hour

      // Check if lastCheckedDate is before the reset hour and currentDateTimeUTC is after the reset hour
      if (!lastCheckedDate || lastCheckedDate < currentDateAtResetHour && currentDateTimeUTC > currentDateAtResetHour) {
        if (isWeeklyResetDue(lastCheckedDate, currentDateTimeUTC)) {
          console.log("Weekly reset !");
          handleWeekyAutoResetTasks();
        } else {
          console.log("Daily reset !");
          handleDailyAutoResetTasks();
        }
        localStorage.setItem(`${appName}-lastCheckedDate`, currentDateTimeUTC.toISOString());
      } else {
        console.log("check passed !");
        console.log(`last daily reset= ${currentDateAtResetHour.toUTCString()}`);
      }
    }

  }, [checkResetTimer]);

  // Function to check if the weekly reset is due (on Wednesday at 10 AM UTC)
  const isWeeklyResetDue = (lastCheckedDate, currentDateTimeUTC) => {
    // Get the current date at the reset hour (Wednesday 10 AM UTC)
    const currentDateAtResetHour = new Date(currentDateTimeUTC);
    currentDateAtResetHour.setUTCHours(resetHours, 0, 0, 0); // Set to 10 AM UTC

    // Adjust the currentDate to the most recent Wednesday before or equal to today (if today is not Wednesday)
    const currentWeekday = currentDateTimeUTC.getUTCDay();
    const daysUntilLastWednesday = (currentWeekday + (7 - weeklyResetDay)) % 7;  // Calculate how many days since last Wednesday
    const lastWednesdayDate = new Date(currentDateTimeUTC);
    lastWednesdayDate.setUTCDate(currentDateTimeUTC.getUTCDate() - daysUntilLastWednesday);
    lastWednesdayDate.setUTCHours(resetHours, 0, 0, 0); // Set it to Wednesday at 10 AM UTC

    // Check if a full week has passed since the last checked date
    if (!lastCheckedDate || lastCheckedDate < lastWednesdayDate && currentDateTimeUTC > lastWednesdayDate) {
      return true;  // Weekly reset is due
    }

    return false; // Weekly reset is not due
  };

  // Save updated state to localStorage whenever taskCompletionState changes
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false; // Set flag to false after initial render
    } else if (!loading) {
      localStorage.setItem(`${appName}-taskCompletionState`, JSON.stringify(taskCompletionState));
    }
  }, [taskCompletionState, loading]);

  // Handler to update task completion state
  const handleTaskToggle = (characterName, taskName) => {
    const updatedState = { ...taskCompletionState };

    // Toggle the completion state of the specified task
    updatedState[characterName] = {
      ...updatedState[characterName], // Copy existing tasks for the character
      [taskName]: !updatedState[characterName][taskName] // Toggle the specific task
    };
    setTaskCompletionState(updatedState);
  };

  // Handler to reset all tasks to false
  const handleDailyAutoResetTasks = () => {
    window.alert("Daily reset has happened.");
    const resetState = jsonData.reduce((acc, char) => {
      acc[char.name] = {
        ...taskCompletionState[char.name],  // Retain other fields if present
        "World Event": false // Reset "World Event" field to false
      };
      return acc;
    }, {});
    setTaskCompletionState(resetState);
  };

  // Handler to reset all tasks to false
  const handleWeekyAutoResetTasks = () => {
    window.alert("Weekly reset has happened.");
    const resetState = jsonData.reduce((acc, char) => {
      acc[char.name] = {};
      return acc;
    }, {});
    setTaskCompletionState(resetState);
  };

  // Handler to reset all tasks to false
  const handleResetTasks = () => {
    const confirmed = window.confirm("Are you sure you want to reset all tasks?");
    if (confirmed) {
      const resetState = jsonData.reduce((acc, char) => {
        acc[char.name] = {};
        return acc;
      }, {});

      setTaskCompletionState(resetState);
    }
  };

  // Show loading spinner while loading
  if (loading) {
    return (
      <Segment textAlign="center" style={{ padding: '20px' }}>
        <Loader active inline="centered">Loading Tasks...</Loader>
      </Segment>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <Header as="h3" textAlign="center">Task List</Header>

      <Grid columns={2} doubling stackable>
        {jsonData.map((character, index) => (
          <Grid.Column key={index}>
            <Card>
              <Card.Content>
                <Header as="h5">{character.name}</Header>
                <TaskList
                  tasks={character.tasks}
                  taskCompletion={taskCompletionState[character.name] || {}}
                  onTaskToggle={(taskName) => handleTaskToggle(character.name, taskName)} />
              </Card.Content>
            </Card>
          </Grid.Column>
        ))}
      </Grid>

      <Segment textAlign="center">
        <Button onClick={handleResetTasks} color="red" size="large">Weekly Reset</Button>
      </Segment>
    </div>
  );
}