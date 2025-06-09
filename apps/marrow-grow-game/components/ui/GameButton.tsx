"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GameButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary"
  className?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export default function GameButton({
  children,
  onClick,
  variant = "primary",
  className,
  icon,
  disabled = false,
}: GameButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative px-4 py-2 font-pixel tracking-wide transition-all duration-200 border-2 rounded-md",
        variant === "primary" && [
          "bg-purple-600",
          "border-purple-500",
          "text-white",
          "hover:bg-purple-500",
          "hover:border-purple-400",
          "active:scale-95",
          "shadow-lg hover:shadow-xl",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600",
        ],
        variant === "secondary" && [
          "bg-purple-700",
          "border-purple-600",
          "text-white",
          "hover:bg-purple-600",
          "hover:border-purple-500",
          "active:scale-95",
          "shadow-lg hover:shadow-xl",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-700",
        ],
        className,
      )}
    >
      <span className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </span>
    </Button>
  )
}
