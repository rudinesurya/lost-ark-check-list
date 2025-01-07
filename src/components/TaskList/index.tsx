import { Card, Checkbox, Header } from 'semantic-ui-react';

const TaskList = ({ tasks, taskCompletion, onTaskToggle }) => {
    return (
        <Card style={{ padding: '1.5em', backgroundColor: '#f8f8f8' }}>
            <Header as="h4">Tasks</Header>
            {tasks.map((task, index) => (
                <Checkbox
                    key={index}
                    checked={taskCompletion[index]}
                    onChange={() => onTaskToggle(index)}
                    label={task}
                />
            ))}
        </Card>
    );
};

export default TaskList;