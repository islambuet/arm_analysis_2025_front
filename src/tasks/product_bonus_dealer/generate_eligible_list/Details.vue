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
    </div>
    <div class="card-body" style='overflow-x:auto;min-height:250px;'>
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in item.columns.all">
            <th class="position-relative align-middle" v-if="item.columns.hidden.indexOf(key)<0" :key="'th_'+key">
              <ColumnSort :columns="item.columns" :sortKey="key" :position="'left:5px'"  :onChangeSort="setFilteredItems" v-if="taskData.permissions.action_6 && column.sortable"/>
              <div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">
                {{ column.label }}
              </div>
              <ColumnFilter :column="column" :position="'right:5px'"  :onChangeFilter="setFilteredItems" v-if="taskData.permissions.action_6 && column.filterable"/>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
          <tr v-for="itm in item.itemsFiltered">
            <template v-for="(column,key) in item.columns.all">
              <td :class="((['id','quantity','unit_price','amount'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="item.columns.hidden.indexOf(key)<0" :key="'td_'+key">
                {{ itm[key] }}
              </td>
            </template>
          </tr>
        </tbody>
      </table>
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
  import ColumnSort from '@/components/ColumnSort.vue';
  import ColumnFilter from '@/components/ColumnFilter.vue';


  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let item=reactive({
    id:0,
    exists:false,
    detailFields:{},
    itemsFiltered: [],    //for display
    columns:{all:{},hidden:[],sort:{key:'',dir:''}},
    pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},
    data:{
    },
    bonus_data:[]
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

    key='generated_at';
    detailFields[key] = {
      label: labels.get('label_'+key),
      type:'date',
      values:[item.data[key]],
    };
    key='created_by';
    detailFields[key] = {
      label: 'Created User Id',
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
  const setColumns=()=>{
    let columns={}
    let key='part_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='area_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='territory_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='distributor_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='dealer_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='bonus_group';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_eligible';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };

    key='quantity_balance_new';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_delivered';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    item.columns.all=columns
  }
  setColumns();
  const setFilteredItems=()=>{
    item.itemsFiltered=systemFunctions.getFilteredItems(item.bonus_data,item.columns);
  }
  const getItem=async ()=>{
    await axios.get(taskData.api_url+'/get-item-details/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        item.data=res.data.item;
        item.bonus_data=res.data.bonus_data;
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