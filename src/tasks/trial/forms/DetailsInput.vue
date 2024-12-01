<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      {{taskData.cropInfo.name}}-&nbsp;{{taskData.formInfo.name}}
      <div>{{labels.get('label_details_task')}} ({{item.id}})</div>
    </div>
    <div class="card-body">
        <DetailTemplate :detailFields="item.detailFields" />
    </div>
  </div>
</template>
<script setup>


  import toastFunctions from "@/assets/toastFunctions";
  import labels from '@/labels'
  
  import {useRouter} from "vue-router";
  import {inject, reactive} from "vue";
  import axios from "axios";
  import InputTemplate from '@/components/InputTemplate.vue';
  import DetailTemplate from '@/components/DetailTemplate.vue';
  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let item=reactive({
    id:0,
    exists:false,
    detailFields:{},
    data:{
    }
  })
  const setDetailFields=async ()=>{
    item.detailFields= {};
    item.exists=false;
    await systemFunctions.delay(1);
    let detailFields={}
    let key='id';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'hidden',
      values:[item.data[key]],
    };
    key='name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='type';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='options';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:item.data[key]?item.data[key].split("\r\n"):[]
    };
    key='default';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='mandatory';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='class';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='created_at';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'date-time',
      values:[item.data[key]],
    };
    key='updated_at';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'date-time',
      values:[item.data[key]],
    };
    item.detailFields=detailFields;
    item.exists=true;
  }
  const getItem=async ()=>{
    await axios.get(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id+'/get-item/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.item;
        setDetailFields();
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  item.id=taskData.input_id;
  getItem();

</script>