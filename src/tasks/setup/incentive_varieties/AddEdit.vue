<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" >
    <div class="card-header">
      <div v-if="item.id>0">{{labels.get('label_edit_task')}}</div>
      <div v-else>{{labels.get('label_new_task')}}</div>
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" name="item[variety_id]" :value="item.id">
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_crop_name')}}</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.variety.crop_name}} </label>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_crop_type_name')}}</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.variety.crop_type_name}} </label>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_name')}}</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{item.variety.name}} </label>
          </div>
        </div>
        <div class="row mb-2" v-for="slab in taskData.incentive_slabs">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{slab.name}}% +</label>
          </div>
          <div class="col-lg-4 col-8">
            <input type="text" :name="'item[incentive]['+slab.id+']'" class="form-control float_positive" :value="item.incentive[slab.id]?item.incentive[slab.id]:''">
          </div>
        </div>
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
  inputFields:{crop_types:[],varieties_arm:[],varieties_competitor:[]},
  incentive:{
  },
  variety:{}
})
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      router.push(taskData.api_url)
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.incentive=res.data.incentive;
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
  item.id=route.params['item_id']?route.params['item_id']:0;
for (let i in taskData.varieties){
  if (taskData.varieties[i].id==item.id){
    item.variety=taskData.varieties[i];
    break;
  }
}
if(item.id>0){
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    getItem();
  }
}
</script>