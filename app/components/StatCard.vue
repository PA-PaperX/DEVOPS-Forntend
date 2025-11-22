<template>
  <div class="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
    
    <div class="flex flex-col">
      <span class="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {{ label }}
      </span>

      <div :class="colorClass ?? 'text-gray-800'">
         <slot>
           <span class="text-3xl font-bold">{{ value }}</span>
         </slot>
      </div>
    </div>

    <div v-if="$slots.icon" class="rounded-full bg-gray-50 p-3 text-gray-500">
      <slot name="icon" />
    </div>
    
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value?: string | number
  colorClass?: string
}

defineProps<Props>()
</script>