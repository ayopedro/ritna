'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/app/components/ui/dialog';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
};

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description = 'A modal window',
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md bg-white'>
        <DialogHeader>
          {title && (
            <DialogTitle className='text-xl font-semibold'>{title}</DialogTitle>
          )}
        </DialogHeader>
        <DialogDescription className='text-sm text-muted-foreground'>
          {description}
        </DialogDescription>
        <div className='modal-content py-2'>{children}</div>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
