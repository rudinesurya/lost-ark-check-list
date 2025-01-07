import React, { useEffect, useRef, useState } from 'react';
import { Card, Grid, Button, Loader, Segment, Header, Form } from 'semantic-ui-react';
import TaskList from '../../components/TaskList';

const appName = 'lost-ark-check-list';
const characterList = ["Seoa", "Daum", "Kool", "Haraguchi", "Deathscythe", "Sukilul"];
const taskList = ["Guild Shop", "Exchanges", "Raid-1", "Raid-2", "Raid-3"];

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
      const initialState = characterList.reduce((acc, char) => {
        acc[char] = savedState[char] || taskList.map(() => false);
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
    const updatedState = { ...taskCompletionState };
    updatedState[characterName][taskIndex] = !updatedState[characterName][taskIndex];
    setTaskCompletionState(updatedState);
  };

  // Handler to reset all tasks to false
  const handleResetTasks = () => {
    const confirmed = window.confirm("Are you sure you want to reset all tasks?");
    if (confirmed) {
      const resetState = characterList.reduce((acc, char) => {
        acc[char] = taskList.map(() => false);
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
        {characterList.map((character, index) => (
          <Grid.Column key={index}>
            <Card>
              <Card.Content>
                <Header as="h5">{character}</Header>
                <TaskList
                  tasks={taskList}
                  taskCompletion={taskCompletionState[character] || []}
                  onTaskToggle={(taskIndex) => handleTaskToggle(character, taskIndex)} />
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