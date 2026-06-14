type BadgeTone = 'red' | 'green' | 'blue' | 'amber' | 'violet' | 'sky' | 'emerald' | 'slate' | 'orange' | 'neutral'

const factionTones: Record<string, BadgeTone> = {
  thuc: 'green',
  ngo: 'red',
  nguy: 'blue',
  quan: 'amber',
  khac: 'neutral'
}

const troopTypeTones: Record<string, BadgeTone> = {
  ky: 'violet',
  ki: 'violet',
  cung: 'sky',
  thuong: 'emerald',
  khien: 'slate',
  thuan: 'slate',
  khi_gioi: 'orange',
  xe: 'orange'
}

const badgeToneClasses: Record<BadgeTone, string> = {
  red: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  green: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  violet: 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  sky: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  slate: 'border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  orange: 'border-orange-500/30 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  neutral: 'border-default bg-elevated text-default'
}

export function factionBadgeClass(value: string) {
  return badgeToneClasses[factionTones[badgeKey(value)] ?? 'neutral']
}

export function troopTypeBadgeClass(value: string) {
  return badgeToneClasses[troopTypeTones[badgeKey(value)] ?? 'neutral']
}

export function tagBadgeClass() {
  return 'border-default bg-elevated/70 text-default'
}

function badgeKey(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}
