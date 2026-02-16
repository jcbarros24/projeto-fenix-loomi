'use client'

import Link from 'next/link'

import { AuthTemplateProps } from './types'

export default function AuthTemplate({
  title,
  subtitle,
  form,
  footerLink,
  secondaryAction,
}: AuthTemplateProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
        </div>

        {/* Card Container */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {form}

          {secondaryAction && (
            <>
              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">ou</span>
                </div>
              </div>
              {secondaryAction}
            </>
          )}
        </div>

        {/* Footer */}
        {footerLink && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {footerLink.text}{' '}
              <Link
                href={footerLink.href}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {footerLink.linkText}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
