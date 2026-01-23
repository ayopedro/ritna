type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

const Modal = ({ isOpen, onClose, children, title }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <dialog 
        open 
        className='modal relative outline-none min-w-md py-2 px-4 rounded-lg shadow-lg bg-white'
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-2 text-gray-400 hover:text-red-500 text-2xl cursor-pointer"
        >
          &times;
        </button>
        <div className='flex flex-col gap-4'>
          {title && <h2 className='text-xl font-semibold'>{title}</h2>}
          <div className='modal-content'>{children}</div>
        </div>
      </dialog>
    </div>
  );
};

export default Modal;
