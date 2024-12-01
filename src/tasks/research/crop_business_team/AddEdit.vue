<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div v-if="item.id>0">{{labels.get('label_edit_task')}}({{item.id}})</div>
      <div v-else>{{labels.get('label_new_task')}}</div>
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
      </form>
    </div>
  </div>
</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let item=reactive({
  id:0,
  exists:false,
  inputFields:{},
  data:{
    id:0,
    name:'',
    crop_name:'',
    crop_type2_name:'',
    part_name:'',
    area_name:'',
    competitorVarieties:[],
    territory_name:'',
    characteries:'',
  }
})
const setInputFields=async ()=>{
  item.inputFields= {};
  await systemFunctions.delay(1);
  let inputFields={}
  let key='save_token';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:new Date().getTime(),
    mandatory:true
  };
  key='id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:item.data[key],
    mandatory:true
  };
  key='part_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='area_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='territory_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='crop_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='crop_type2_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='market_size';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='sowing_periods';
  let sowing_periods=item.data[key].split(",");
  let sowing_periods_names=[];
  for(let i=0;i<sowing_periods.length;i++){
    if(sowing_periods[i]>0){
      sowing_periods_names.push(labels.get('label_month_short_'+sowing_periods[i]))
    }
  }
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:sowing_periods_names.join('<br>'),
    mandatory:false
  };
  key='competitor_varieties_ids';
  let competitor_varieties_ids=item.data[key].split(",");
  let competitor_varieties_names=[];
  for(let i=0;i<taskData.competitor_varieties.length;i++){
    if(competitor_varieties_ids.includes(taskData.competitor_varieties[i].id.toString())){
      competitor_varieties_names.push(taskData.competitor_varieties[i].name)
    }
  }
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:competitor_varieties_names.join('<br>'),
    mandatory:false
  };
  key='characteries';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'text',
    default:item.data[key],
    mandatory:true
  };
  item.inputFields=inputFields;
  await systemFunctions.delay(1);


}
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      if(save_and_new){
        if(item.id>0){
          router.push(taskData.api_url+"/add")
        }
        else{
          setInputFields();
        }
      }
      else{
        router.push(taskData.api_url)
      }
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.item;
      setInputFields();
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
  item.id=route.params['item_id']?route.params['item_id']:0;

  if(item.id>0){
    if(!(taskData.permissions.action_2)){
      toastFunctions.showAccessDenyMessage();
    }
    else{
      getItem();
    }
  }
  else{
    if(!(taskData.permissions.action_1)){
      toastFunctions.showAccessDenyMessage();
    }
    else{
      setInputFields();
      item.exists=true;
    }
  }
</script>