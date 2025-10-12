<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
      <router-link v-if="taskData.permissions.action_3"  :to="taskData.api_url+'/upload'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-upload"></i> {{labels.get('label_upload')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" >
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      Manual Entry under construction
    </div>
  </div>
</template>
<script setup>
    import globalVariables from "@/assets/globalVariables";
    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'
    import {inject, reactive, ref} from 'vue'
    import {useRouter} from 'vue-router';
    import axios from "axios";
    import InputTemplate from '@/components/InputTemplate.vue';
    import ColumnControl from '@/components/ColumnControl.vue';
    import toastFunctions from "@/assets/toastFunctions";

    const router =useRouter()
    let taskData = inject('taskData')
    let show_column_controls=ref(false)
    let item=reactive({
      id:0,
      exists:false,
      inputFields:{},
    })

</script>
