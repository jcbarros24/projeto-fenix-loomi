'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import CloseIcon from '@mui/icons-material/Close'
import { Controller, useForm } from 'react-hook-form'

import { Label } from '@/components/atoms/Label/label'
import InputField from '@/components/molecules/InputField/inputField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreateTicketFormData,
  CreateTicketFormInput,
  CreateTicketPayload,
  CreateTicketSchema,
} from '@/validations/ticket'

type CreateTicketModalProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  nextTicketId: string
  loading?: boolean
  onSubmit: (payload: CreateTicketPayload) => Promise<void>
}

const priorityOptions = [
  { label: 'Urgente', value: 'Urgente' },
  { label: 'Alta', value: 'Alta' },
  { label: 'Média', value: 'Média' },
  { label: 'Baixa', value: 'Baixa' },
]

export function CreateTicketModal({
  isOpen,
  setIsOpen,
  nextTicketId,
  loading = false,
  onSubmit,
}: CreateTicketModalProps) {
  const { control, handleSubmit } = useForm<CreateTicketFormInput>({
    mode: 'onChange',
    resolver: zodResolver(CreateTicketSchema),
    defaultValues: {
      priority: undefined,
    },
  })

  const closeModal = () => {
    if (loading) return
    setIsOpen(false)
  }

  const handleSubmitForm = async (data: CreateTicketFormData) => {
    const payload: CreateTicketPayload = {
      ...data,
      ticketId: nextTicketId,
      status: 'Aberto',
    }
    console.log(
      '[CREATE_TICKET] Formulário submetido - payload para POST:',
      payload,
    )
    try {
      await onSubmit(payload)
      console.log('[CREATE_TICKET] onSubmit concluído com sucesso')
    } catch (error) {
      console.error('[CREATE_TICKET] Erro no onSubmit:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[32px] border border-white/10 !bg-[#0b0d1c] p-8 text-white sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="font-regular font-space-grotesk text-4xl text-white">
              Novo Ticket
            </DialogTitle>
            <DialogDescription className="mt-6 text-lg text-white/75">
              Preencha os dados abaixo para registrar um novo ticket na
              plataforma.
            </DialogDescription>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-full border border-white/60 p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Fechar modal"
          >
            <CloseIcon />
          </button>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit(handleSubmitForm)}
        >
          <div className="flex flex-col gap-2">
            <Label
              className="pl-4 font-space-grotesk font-medium text-white"
              htmlFor="client"
            >
              Nome do cliente
            </Label>
            <InputField
              name="client"
              control={control}
              variant="modal"
              type="text"
              label="Nome da pessoa ou empresa que está solicitando o suporte"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              className="pl-4 font-space-grotesk font-medium text-white"
              htmlFor="email"
            >
              Email
            </Label>
            <InputField
              name="email"
              control={control}
              variant="modal"
              type="text"
              label="E-mail de contato para atualizações e resposta"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              className="pl-4 font-space-grotesk font-medium text-white"
              htmlFor="priority"
            >
              Prioridade
            </Label>
            <Controller
              name="priority"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-2">
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                    onOpenChange={(open) => !open && field.onBlur()}
                  >
                    <SelectTrigger variant="modal">
                      <SelectValue placeholder="Selecione o nível de urgência do atendimento" />
                    </SelectTrigger>
                    <SelectContent variant="modal">
                      {priorityOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          variant="modal"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <span className="text-sm text-red-400">
                      {fieldState.error.message}
                    </span>
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label
              className="pl-4 font-space-grotesk font-medium text-white"
              htmlFor="responsible"
            >
              Responsável
            </Label>
            <InputField
              name="responsible"
              control={control}
              variant="modal"
              type="text"
              label="Quem será o responsável por esse ticket"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              className="pl-4 font-space-grotesk font-medium text-white"
              htmlFor="subject"
            >
              Assunto
            </Label>
            <InputField
              name="subject"
              control={control}
              variant="modal"
              type="text"
              label="Resumo breve do problema ou solicitação"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="h-16 min-w-40 rounded-3xl border-white/60 bg-transparent text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="h-16 min-w-40 rounded-3xl"
              loading={loading}
              loadingText="Salvando..."
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
