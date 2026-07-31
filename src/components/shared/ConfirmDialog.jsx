import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

/**
 * A reusable confirmation dialog built on the shadcn Dialog primitive.
 *
 * @param {boolean}  open        - Controls dialog visibility.
 * @param {string}   title       - Heading text shown in the dialog.
 * @param {string}   [description] - Optional body text describing the action.
 * @param {Function} onConfirm   - Called when the user clicks "Confirm".
 * @param {Function} [onCancel]  - Called when the user clicks "Cancel" or closes the dialog.
 */
export default function ConfirmDialog({ open, title, description, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                       border border-white/10 bg-white/5 text-white/80
                       hover:bg-white/10 hover:text-white
                       focus:outline-none focus:ring-2 focus:ring-white/20
                       transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
                       bg-red-600 text-white
                       hover:bg-red-700
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]
                       transition-colors"
          >
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
