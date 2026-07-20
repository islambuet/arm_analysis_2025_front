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
      {{labels.get('label_new_task')}}
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
      </form>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists && Object.keys(item.data.delivery_data).length>0">
    <div class="card-header">
      Other Delivery
    </div>
    <div class="card-body">
      <table id="table_list" class="table table-bordered">
        <thead class="table-active">
          <th>Action</th>
          <th>Quantity</th>
          <th>Remarks</th>
          <th>Entry date</th>
        </thead>
        <tbody class="table-striped table-hover">
          <tr v-for="(delivery,index) in item.data.delivery_data">
            <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="cancelDelivery(index)"><i class="feather icon-delete"></i> {{labels.get('action_3')}}</button></td>
            <td>{{ delivery['quantity'] }}</td>
            <td>{{ delivery['remarks'] }}</td>
            <td>{{ systemFunctions.displayDate(delivery['created_at']) }}</td>
          </tr>
        </tbody>
      </table>
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
  id:'',
  exists:false,
  inputFields:{},
  data:{
    id:'',
    bonus_data:{},
    delivery_data:[],
    quantity:'',
    remarks:'',
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
    default:item.id,
    mandatory:true
  };

  key='quantity_eligible';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: "Eligible Quantity",
    type:'textonly',
    default:item.data.bonus_data[key],
    mandatory:false
  };
  key='quantity_balance_new';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Current Balance',
    type:'textonly',
    default:item.data.bonus_data[key],
    mandatory:false
  };
  key='quantity';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Delivery Quantity',
    type:'text',
    class:'float_all',
    default:item.data[key],
    mandatory:false
  };
  key='remarks';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Remarks',
    type:'textarea',
    default:item.data[key],
    mandatory:false
  };
  item.inputFields=inputFields;


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
const cancelDelivery=async (index)=>{
  const userConfirmed = confirm("Are you sure you want to proceed?");
  if(userConfirmed)
  {
    await axios.get(taskData.api_url+'/delete-item/'+ item.id+'_'+index).then((res)=>{
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
  else{
    console.log('cancelted')
  }
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
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    getItem();
  }

</script>