import React, { useEffect, useRef, useState } from 'react';
import { Card, Grid, Button, Loader, Segment, Header, Form } from 'semantic-ui-react';
import TaskList from '../../components/TaskList';

const appName = 'lost-ark-check-list';

import jsonData from '../../../template.json' assert { type: 'json' };

export default function App() {
  const [taskCompletionState, setTaskCompletionState] = useState({});
  const [loading, setLoading] = useState(true); // Track loading state
  const isInitialRender = useRef(true); // Track initial render

  // Load initial state from localStorage
  useEffect(() => {
    const loadState = () => {
      let savedState = {};
      try {
        const storedState = localStorage.getItem(`${appName}-taskCompletionState`);
        savedState = storedState ? JSON.parse(storedState) : {};
      } catch (error) {
        console.error("Failed to parse taskCompletionState from localStorage:", error);
      }
      const initialState = jsonData.reduce((acc, char) => {
        acc[char.name] = savedState[char.name] || char.tasks.map(() => false);
        return acc;
      }, {});
      setTaskCompletionState(initialState);
      setLoading(false); // Data loaded
    };

    loadState();
  }, []);

  // Save updated state to localStorage whenever taskCompletionState changes
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false; // Set flag to false after initial render
    } else if (!loading) {
      localStorage.setItem(`${appName}-taskCompletionState`, JSON.stringify(taskCompletionState));
    }
  }, [taskCompletionState, loading]);

  // Handler to update task completion state
  const handleTaskToggle = (characterName, taskIndex) => {
    // console.log(`${characterName} --- ${taskIndex}`);
    const updatedState = { ...taskCompletionState };
    updatedState[characterName][taskIndex] = !updatedState[characterName][taskIndex];
    setTaskCompletionState(updatedState);
  };

  // Handler to reset all tasks to false
  const handleResetTasks = () => {
    const confirmed = window.confirm("Are you sure you want to reset all tasks?");
    if (confirmed) {
      const resetState = jsonData.reduce((acc, char) => {
        acc[char.name] = char.tasks.map(() => false);
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
                  taskCompletion={taskCompletionState[character.name] || []}
                  onTaskToggle={(taskIndex) => handleTaskToggle(character.name, taskIndex)} />
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