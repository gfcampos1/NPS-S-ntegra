"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteFormButtonProps {
  formId: string;
  formTitle: string;
  hasResponses: boolean;
}

export function DeleteFormButton({ formId, formTitle, hasResponses }: DeleteFormButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (hasResponses && !confirm(`Este formulário tem respostas. Tem certeza que deseja excluir "${formTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar formulário');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Erro ao deletar formulário');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(false)}
        disabled={isDeleting}
      >
        Cancelar
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Excluindo...' : 'Confirmar'}
      </Button>
    </div>
  );
}
