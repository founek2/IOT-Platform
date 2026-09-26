import { logger } from 'common/logger/index';
import type { Identifier, XYCoord } from 'dnd-core';
import React, { useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

export interface DragItem {
    id: string;
    index: number;
}

export interface DraggableComponentProps {
    id: string;
    index: number;
    onMove: (dragId: string, hoverId: string) => void;
    render: (isDraggin: boolean, ref: React.RefObject<HTMLDivElement>) => JSX.Element;
    type: string;
    onDrop?: () => any;
}
export function DraggableComponent({ id, index, onMove, render, type, onDrop }: DraggableComponentProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
        accept: type,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(item, monitor) {
            console.log('drop');
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return;
            }
            console.log('id ', id);
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
            // When dragging downwards, only move when the cursor is below 25%
            // When dragging upwards, only move when the cursor is above 25%

            console.log(dragIndex, hoverIndex, hoverClientY, hoverMiddleY);
            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY / 1.5) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY * 1.5) {
                return;
            }

            // Time to actually perform the action
            console.log('move');
            onMove(item.id, id);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type,
        item: () => {
            return { id, index };
        },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));
    return render(isDragging, ref);
}

export function Draggable({ dragDisabled, render, ...props }: DraggableComponentProps & { dragDisabled?: boolean }) {
    if (dragDisabled) return render(false, { current: null });

    return <DraggableComponent {...props} render={render} />;
}

export interface DroppableComponentProps {
    onDrop: (item: DragItem) => void;
    onHover?: (item: DragItem) => void;
    render: (isDraggin: boolean, ref: React.RefObject<HTMLDivElement>) => JSX.Element;
    type: string;
}
export function DroppableComponent({ render, type, onDrop, onHover }: DroppableComponentProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
        accept: type,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        drop(item, monitor) {
            onDrop(item);
        },
        hover(item) {
            if (onHover) onHover(item);
        },
    });

    drop(ref);
    return render(false, ref);
}

export function Droppable({ dragDisabled, render, ...props }: DroppableComponentProps & { dragDisabled?: boolean }) {
    if (dragDisabled) return render(false, { current: null });

    return <DroppableComponent {...props} render={render} />;
}

const checkIfTouchScreen = () => matchMedia('(hover: none), (pointer: coarse)').matches;

export function DraggableProvider({
    children,
    disabled,
}: {
    children: React.ReactElement | React.ReactElement[];
    disabled?: boolean;
}) {
    const isTouchScreen = checkIfTouchScreen();

    if (disabled) return <>{children}</>;

    if (isTouchScreen) {
        logger.debug('Using TouchBackend');
        return <DndProvider backend={TouchBackend}>{children}</DndProvider>;
    }

    logger.debug('Using HTML5Backend');
    return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
