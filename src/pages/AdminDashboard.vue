<template v-if="selectedTable === 'workOrders'">
  <!-- 1. Kolom No. WO -->
  <template v-if="col.key === 'workOrderNumber'">
    <strong>
      {{ item.workOrderNumber || item.woNumber || item.code || (item._id ? item._id.substring(0, 8) : '-') }}
    </strong>
  </template>

  <!-- 2. Kolom Judul Pekerjaan -->
  <template v-else-if="col.key === 'title'">
    {{ item.title || item.reportTitle || item.reportId?.title || item.report?.title || '-' }}
  </template>

  <!-- 3. Kolom Teknisi -->
  <template v-else-if="col.key === 'technicians'">
    {{ getTechnicianName(item) }}
  </template>

  <!-- 4. Kolom Prioritas -->
  <template v-else-if="col.key === 'priority'">
    <span :class="['priority-badge', (item.priority || item.reportId?.priority || 'NORMAL').toLowerCase()]">
      {{ item.priority || item.reportId?.priority || '-' }}
    </span>
  </template>

  <!-- 5. Kolom Status -->
  <template v-else-if="col.key === 'status'">
    <span :class="['status-badge', (item.status || 'PENDING').toLowerCase()]">
      {{ item.status || 'ASSIGNED' }}
    </span>
  </template>

  <template v-else>
    {{ item[col.key] || '-' }}
  </template>
</template>

<!-- Fallback untuk tabel lain (Users & Reports) -->
<template v-else>
  <template v-if="col.key === 'role'">
    <span class="role-badge">{{ item.role || 'USER' }}</span>
  </template>

  <template v-else-if="col.key === 'status'">
    <span :class="['status-badge', (item[col.key] || 'PENDING').toLowerCase()]">
      {{ item[col.key] || 'PENDING' }}
    </span>
  </template>

  <template v-else-if="col.key === 'createdAt' || col.key === 'visitDate'">
    {{ formatDate(item[col.key]) }}
  </template>

  <template v-else-if="col.key === 'contact'">
    {{ item.phone || item.phoneNumber || '-' }}
  </template>

  <template v-else>
    {{ item[col.key] || '-' }}
  </template>
</template>
