<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(true)"><i class="feather icon-plus-square"></i> {{labels.get('label_save_new')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      {{taskData.cropInfo.name}}-&nbsp;{{taskData.formInfo.name}}
      <div v-if="item.id>0">{{labels.get('label_edit_input')}}({{item.id}})</div>
      <div v-else>{{labels.get('label_new_input')}}</div>
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
    type:'text',
    options:'',
    default:'',
    mandatory:'No',
    class:'',
    ordering:99,
    status:'Active',
  }
})
const setInputFields=async ()=>{
  item.inputFields= {};
  item.exists=false;
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
  key='name';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'text',
    default:item.data[key],
    mandatory:true
  };
  key='type';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:[
        {label:"Text",value:'text'},
        {label:"TextArea",value:'textarea'},
        {label:"Image",value:'image'},
        {label:"Date",value:'date'},
        {label:"DropDown",value:'dropdown'},
        {label:"CheckBox",value:'checkbox'},
        {label:"Features",value:'features'},
        {label:"URL",value:'url'},
    ],
    default:item.data[key],
    mandatory:true
  };
  key='options';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'textarea',
    default:item.data[key],
    mandatory:true
  };
  key='options_hint';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: '',
    type:'hint',
    default:'Write each option in each line',
    mandatory:true
  };
  key='default';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'text',
    default:item.data[key],
    mandatory:true
  };

  key='mandatory';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:[{label:"Yes",value:'Yes'},{label:"No",value:'No'}],
    default:item.data[key],
    mandatory:true
  };
  key='class';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'text',
    default:item.data[key],
    mandatory:true
  };
  key='class_hint';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: '',
    type:'hint',
    default:'float_positive=Only Positive floating number<br>' +
        'integer_positive=Only Positive Integer number<br>' +
        'float_all=Positive and negetive floating number<br>' +
        'integer_all=Positive and negetive Integer number<br>' +
        'For Image default resize size is 1.3MB<br>' +
        'Use differnt value in MB(only numeric) if you want differnt size to resize',
    mandatory:true
  };
  key='ordering';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'number',
    default:item.data[key],
    mandatory:false
  };
  key='status';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:[{label:"Active",value:'Active'},{label:"In-Active",value:'In-Active'}],
    default:item.data[key],
    mandatory:true
  };
  item.inputFields=inputFields;
  //TODO exits should be here
  item.exists=true;
  $(document).off('change','#type');
  $(document).on("change", "#type", function(event){
    console.log($('#type').val())
    if(['checkbox','dropdown'].includes($('#type').val())){
      $('#options').closest('.row').show();
      $('#options_hint').closest('.row').show();
    }
    else{
      $('#options').closest('.row').hide();
      $('#options_hint').closest('.row').hide();
    }
  });
  await systemFunctions.delay(1)//for change options
  $('#type').trigger('change');//for first time

}
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      taskData.loadListDataInput=true
      toastFunctions.showSuccessfullySavedMessage();
      if(save_and_new){
        if(item.id>0){
          router.push(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id+'/add')
        }
        else{
          setInputFields();
        }
      }
      else{
        router.push(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id)
      }
    }
    else{
      toastFunctions.showResponseError(res.data)
      if(globalVariables.loadListData){
        globalVariables.loadListData=false;
        taskData.loadListDataInput=true
      }
    }
  });

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/'+taskData.crop_id+'/inputs/'+taskData.form_id+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.item;
      setInputFields();
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
  item.id=taskData.input_id;
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
      setInputFields()
    }
  }
</script>