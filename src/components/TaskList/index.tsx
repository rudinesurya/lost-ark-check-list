import { Card, Checkbox, Header } from 'semantic-ui-react';

const TaskList: React.FC<TaskListProps> = ({ tasks, taskCompletion, onTaskToggle }) => {
    return (
        <Card style={{ padding: '1.5em', backgroundColor: '#f8f8f8' }}>
            <Header as="h4">Tasks</Header>
            {tasks.map((task, index) => (
                <Checkbox
                    key={index}
                    checked={taskCompletion[task] || false}
                    onChange={() => onTaskToggle(task)}
                    label={task}
                />
            ))}
        </Card>
    );
};

// Add PropTypes for type checking
interface TaskListProps {
    tasks: string[]; // Array of task names
    taskCompletion: { [key: string]: boolean };
    onTaskToggle: (taskName: string) => void; // Function to handle toggling tasks
}

export default TaskList;