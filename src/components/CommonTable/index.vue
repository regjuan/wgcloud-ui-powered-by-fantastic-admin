<template>
  <ElTable :data="list" :height="height" style="width: 100%" border>
    <ElTableColumn
      v-for="option in options"
      :key="option.prop"
      :prop="option.prop"
      :label="option.label"
      :width="option.width"
    >

      <template #default="{ row }">
        <slot :name="option.prop" :row="row">
          <span v-if="option.formatter" v-html="option.formatter(row[option.prop], row)"></span>
          <span v-else>{{ row[option.prop] }}</span>
        </slot>
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<script>
export default {
  name: 'CommonTable',
  props: {
    // 表格高度
    height: {
      type: [String, Number],
      default: null
    },
    // 表格数据
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    // 表格列的配置
    options: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>
