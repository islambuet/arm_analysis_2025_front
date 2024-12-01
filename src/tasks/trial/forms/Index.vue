<template>
  <div v-if="taskData.permissions.action_0==1">
    <div v-show="taskData.method=='list-form'" v-if="taskData.renderedForm">
      <ListForm/>
    </div>
    <div v-if="taskData.method=='add-form'">
      <AddEditForm/>
    </div>
    <div v-if="taskData.method=='edit-form'">
      <AddEditForm/>
    </div>
    <template v-if="taskData.renderedInputs">
      <div v-show="taskData.method=='list-input'">
        <ListInput/>
      </div>
      <div v-if="taskData.method=='add-input'">
        <AddEditInput/>
      </div>
      <div v-if="taskData.method=='edit-input'">
        <AddEditInput/>
      </div>
      <div v-if="taskData.method=='details-input'">
        <DetailsInput/>
      </div>
    </template>
  </div>
</template>
<script setup>
import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'
import {provide, reactive, watch} from 'vue'
import {useRoute,useRouter} from 'vue-router';
import axios from 'axios';

import ListForm from './ListForm.vue'
import AddEditForm from './AddEditForm.vue'
import ListInput from './ListInput.vue'
import AddEditInput from "./AddEditInput";
import DetailsInput from "./DetailsInput";

globalVariables.loadListData=true;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'list-from',
  permissions:{},
  itemsForm: {data:[]},
  itemsFilteredForm: [],    //for display
  columnsForm:{all:{},hidden:[],sort:{key:'',dir:''}},
  paginationForm: {current_page: 1,per_page_options: [50,100,500,1000],per_page:-1,show_all_items:true},
  renderedForm:false,
  loadListDataForm:true,

  itemsInput: {data:[]},
  itemsFilteredInput: [],    //for display
  columnsInput:{all:{},hidden:[],sort:{key:'',dir:''}},
  paginationInput: {current_page: 1,per_page_options: [50,100,500,1000],per_page:-1,show_all_items:true},
  renderedInputs:false,
  loadListDataInput:true,

  crop_id:0,
  form_id:0,
  cropInfo:{},
  formInfo:{},


})
labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

const routing=async ()=>{
  let crop_id=route.params['crop_id']?route.params['crop_id']:0;
  let form_id=route.params['form_id']?route.params['form_id']:0;
  let input_id=route.params['input_id']?route.params['input_id']:0;
  if(taskData.crop_id!=crop_id){
    taskData.crop_id=crop_id;
    taskData.loadListDataForm=true;
    taskData.renderedForm=false;
    await init();
    taskData.renderedForm=true;
  }
  taskData.form_id=form_id;
  taskData.input_id=input_id;
  await getItemsForm(taskData.paginationForm);//Load at least once
  //console.log(route.path)
  if(route.path.indexOf(taskData.api_url+'/'+taskData.crop_id+'/inputs')!=-1)
  {
    taskData.renderedInputs=true
    await getItemsInput(taskData.paginationInput);//Load at least once
    //taskData.renderedInput=true
    //getitems
    if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+form_id)){
      taskData.method='list-input';
    }
    else if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+form_id+'/add')){
      taskData.method='add-input';
    }
    else if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+form_id+'/edit/'+input_id)){
      taskData.method='edit-input';
    }
    else if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+form_id+'/details/'+input_id)){
      taskData.method='details-input';
    }
  }
  else{
    taskData.renderedInputs=false
    taskData.loadListDataInput=true
    if(route.path==(taskData.api_url+'/'+taskData.crop_id)){
      taskData.method='list-form';
    }
    else if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/add')){
      taskData.method='add-form';
    }
    else if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/edit/'+form_id)){
      taskData.method='edit-form';
    }
  }
}
watch(route, () => {
  routing();
})

const init=async ()=>{
  await axios.get(taskData.api_url+'/'+taskData.crop_id+'/initialize').then((res)=>{
    if (res.data.error == "") {
      taskData.permissions=res.data.permissions;
      taskData.cropInfo=res.data.cropInfo;
      if(res.data.hidden_columns_form){
        taskData.columnsForm.hidden=res.data.hidden_columns_form;
      }
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
const getItemsForm=async(pagination)=>{
  if(taskData.loadListDataForm)
  {
    await axios.get(taskData.api_url+'/'+taskData.crop_id+'/get-items?page='+ pagination.current_page+'&perPage='+ pagination.per_page)
        .then(res => {
          if(res.data.error==''){
            taskData.itemsForm= res.data.items;
            taskData.setFilteredItemsForm();
          }
          else{
            toastFunctions.showResponseError(res.data)
          }
          taskData.loadListDataForm=false;
        })
  }
}
taskData.setFilteredItemsForm=()=>{
  taskData.itemsFilteredForm=systemFunctions.getFilteredItems(taskData.itemsForm.data,taskData.columnsForm);
}
taskData.reloadItemsForm=(pagination)=>{
  taskData.loadListDataForm=true;
  getItemsForm(pagination);
}

const getItemsInput=async(pagination)=>{
  if(taskData.loadListDataInput)
  {

    await axios.get(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id+'/get-items?page='+ pagination.current_page+'&perPage='+ pagination.per_page)
        .then(res => {
          if(res.data.error==''){
            taskData.formInfo= res.data.formInfo;
            taskData.itemsInput= res.data.items;
            taskData.setFilteredItemsInput();
          }
          else{
            toastFunctions.showResponseError(res.data)
          }
          taskData.loadListDataInput=false;
        })
  }
}
taskData.setFilteredItemsInput=()=>{
  taskData.itemsFilteredInput=systemFunctions.getFilteredItems(taskData.itemsInput.data,taskData.columnsInput);
}
taskData.reloadItemsInput=(pagination)=>{
  taskData.loadListDataInput=true;
  getItemsInput(pagination);
}
provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  routing();
}
</script>
