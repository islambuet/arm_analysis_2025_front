<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
    <div class="card-header">
      <div>{{labels.get('label_details_task')}} ({{item.id}})</div>
    </div>
    <div class="card-body">
        <DetailTemplate :detailFields="item.detailFields" />
        <div class="row mb-2">
          <div class="col-4"><label class="font-weight-bold float-right">Varieties</label></div>
          <div class="col-8">
            <table id="table_varieties" class="table table-bordered">
              <thead>
              <tr>
                <th>Crop</th>
                <th>Type</th>
                <th>Variety</th>
                <th>Product</th>
                <th>Quantity (pkt) </th>
                <th>Quantity (Kg) </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(quantity,pack_size_id) in item.data.pack_sizes">
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].crop_name:'NF'}}</td>
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].type_name:'NF'}}</td>
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].variety_name:'NF'}}</td>
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].name:'NF'}}</td>
                <td class="text-right">{{quantity}}</td>
                <td class="quantity_kg text-right">{{pack_sizes_object[pack_size_id]?((+pack_sizes_object[pack_size_id].value)*(+quantity)/1000):'0'}}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
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


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let item=reactive({
    id:0,
    exists:false,
    detailFields:{},
    data:{
      varieties:{}
    },
  })
  let crops_object={};
  for(let i in taskData.crops){
    crops_object[taskData.crops[i]['id']]=taskData.crops[i];
  }
  let crop_types_object={};
  for(let i in taskData.crop_types){
    crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
  }
  let varieties_object={};
  for(let i in taskData.varieties){
    varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
  }
  let pack_sizes_object={};
  for(let i in taskData.pack_sizes){
    pack_sizes_object[taskData.pack_sizes[i]['id']]=taskData.pack_sizes[i];
  }
  let l
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
    key='sales_at';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'date-time',
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
    item.detailFields=detailFields;
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