import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* wholeItem이면 손잡이 없이 항목 전체를 잡고 끈다. */
function SortableItem({ children, id, wholeItem }) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const handle = (
    <button
      className="admin-drag-handle"
      ref={setActivatorNodeRef}
      type="button"
      aria-label="드래그해서 순서 변경"
      {...attributes}
      {...listeners}
    >
      ⠿
    </button>
  );

  return (
    <div
      className={`admin-sortable${wholeItem ? " admin-sortable--whole" : ""}${isDragging ? " is-dragging" : ""}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...(wholeItem ? { ...attributes, ...listeners } : {})}
    >
      {children(wholeItem ? null : handle)}
    </div>
  );
}

/* items는 고유한 id를 가진 배열이다. renderItem(item, index, handle)로 항목을 그린다. */
function SortableList({
  className,
  items,
  layout = "list",
  onChange,
  renderItem,
  wholeItem = false,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    onChange(arrayMove(items, from, to));
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={
          layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy
        }
      >
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem id={item.id} key={item.id} wholeItem={wholeItem}>
              {(handle) => renderItem(item, index, handle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default SortableList;
