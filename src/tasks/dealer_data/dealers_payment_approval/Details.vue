<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button v-if="item.data.status=='Pending'"  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-success" @click="approveItem"><i class="feather icon-save"></i> Approve</button>
        <router-link v-if="item.data.status=='Pending'" :to="taskData.api_url+'/edit/'+item.id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-edit"></i> Go To Edit</router-link>
        <button v-if="item.data.status=='Approved'" type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary disabled">Approved</button>
        <button v-if="taskData.permissions.action_3"  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger" @click="deleteItem"><i class="feather icon-minus-circle"></i> Delete</button>

      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
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
  import DetailTemplate from '@/components/DetailTemplate.vue';
  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";
  import globalVariables from "@/assets/globalVariables";


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
    await systemFunctions.delay(1);
    let detailFields={}
    let key='id';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'hidden',
      values:[item.data[key]],
    };
    key='payment_at';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'date',
      values:[item.data[key]],
    };
    key='part_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='area_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='territory_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='distributor_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='dealer_name';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    key='status';
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
    key='amount';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'text',
      values:[item.data[key]],
    };
    item.detailFields=detailFields;
  }
  const approveItem=async ()=>{
    // const userConfirmed = confirm("Are you sure you want to Approve?");
    // if(userConfirmed)
    {
      await axios.get(taskData.api_url+'/approve-item/'+ item.id).then((res)=>{
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
    // else{
    //   console.log('approve cancelted')
    // }
  }
  const deleteItem=async ()=>{
    const userConfirmed = confirm("Are you sure you want to proceed?");
    if(userConfirmed)
    {
      await axios.get(taskData.api_url+'/delete-item/'+ item.id).then((res)=>{
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
      console.log('delete cancelted')
    }
  }
  const getItem=async ()=>{
    await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.item;
        setDetailFields();
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  item.id=route.params['item_id'];
  getItem();

</script>