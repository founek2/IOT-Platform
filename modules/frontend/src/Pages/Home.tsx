import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import type { Identifier, XYCoord } from 'dnd-core';
import React, { useCallback, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DraggableProvider } from '../components/Draggable.js';

type Item = { id: number; text: string };
const defaultCards = [
    { id: 1, text: 'ahok\nsdakjdak\ndasd' },
    { id: 2, text: 'balbla\ndasdad\nsdasdě' },
    { id: 3, text: 'sas' },
    { id: 4, text: 'saaaa' },
];

interface DragItem {
    id: number | string;
    index: number;
}

const ItemTypes = {
    CARD: 'CARD',
};

function Dragable({
    id,
    index,
    onMove,
    render,
}: {
    id: string | number;
    index: number | number;
    onMove: (dragIndex: number, hoverIndex: number) => void;
    render: (isDraggin: boolean) => JSX.Element | JSX.Element[];
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
        accept: ItemTypes.CARD,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            // Time to actually perform the action
            onMove(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: () => {
            return { id, index };
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));
    return <Box ref={ref}>{render(isDragging)}</Box>;
}

// export function HomePage() {
//     const [cards, setCards] = useState(defaultCards);

//     const moveCard = useCallback(
//         (dragIndex: number, hoverIndex: number) =>
//             setCards((prevCards: Item[]) => {
//                 const newCards = [...prevCards];
//                 const tmp = newCards[hoverIndex];
//                 newCards[hoverIndex] = newCards[dragIndex];
//                 newCards[dragIndex] = tmp;

//                 return newCards;
//             }),
//         []
//     );

//     return (
//         <DraggableProvider>
//             <Grid container spacing={{ xs: 2 }}>
//                 {cards.map((card, idx) => (
//                     <Grid item xs={2} key={card.id}>
//                         <Dragable
//                             id={card.id}
//                             index={idx}
//                             onMove={moveCard}
//                             render={(isDragging) => <Paper sx={{ opacity: isDragging ? 0.3 : 1 }}>{card.text}</Paper>}
//                         />
//                     </Grid>
//                 ))}
//             </Grid>
//         </DraggableProvider>
//     );
// }

export function HomePage() {
    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h2" fontWeight={500} textAlign="center">
                Vítej!
            </Typography>
            <Typography>
                Pro přihlášení stiskněte tlačítko Login nebo v menu vyber Registrovat pro založení nového účtu
            </Typography>
        </Box>
    );
}
