<template>    
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <div class="row mb-2">
        <div class="col-4">
          <label class="font-weight-bold float-right">{{labels.get('label_fiscal_year')}} <span class="text-danger">*</span></label>
        </div>
        <div class="col-lg-4 col-8">
          <div class="input-group" >
            <select id="fiscal_year" class="form-control">
              <option v-for="i in globalVariables.current_fiscal_year-globalVariables.starting_year+1" :value="i+globalVariables.starting_year-1" :selected="(i+globalVariables.starting_year-1)==taskData.fiscal_year">
                {{i+globalVariables.starting_year-1}}-{{i+globalVariables.starting_year}}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-4">
          <label class="font-weight-bold float-right">{{labels.get('label_season')}} <span class="text-danger">*</span></label>
        </div>
        <div class="col-lg-4 col-8">
          <div class="input-group" >
            <select id="season_id" class="form-control">
              <option v-for="season in taskData.seasons" :value="season.id" :selected="season.id==taskData.season_id">
                {{season.name}}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card mb-2">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body" style='overflow-x:auto;min-height:250px;'>
      <table class="table table-bordered">
        <thead class="table-active">
        <tr>
          <th class="position-relative align-middle d-print-none">{{labels.get('label_action')}}</th>
          <template v-for="(column,key) in taskData.columns.all">
            <th class="position-relative align-middle" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'th_'+key">
              <ColumnSort :columns="taskData.columns" :sortKey="key" :position="'left:5px'"  :onChangeSort="taskData.setFilteredItems" v-if="taskData.permissions.action_6 && column.sortable"/>
              <div class=" text-center " style="width:calc(100% - 33px);margin-left:17px">
                {{ column.label }}
              </div>
              <ColumnFilter :column="column" :position="'right:5px'"  :onChangeFilter="taskData.setFilteredItems" v-if="taskData.permissions.action_6 && column.filterable"/>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">
        <tr v-for="item in taskData.itemsFiltered" :key="'item_'+item.id">
          <td class="col_1 d-print-none">
            <button class="btn btn-sm bg-gradient-primary dropdown-toggle waves-effect waves-light" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{labels.get('label_action')}}</button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0; left: 0; transform: translate3d(0px, 38px, 0px);">
              <router-link v-if="taskData.permissions.action_2"  :to="taskData.api_url+'/edit/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-edit"></i> {{labels.get('label_edit')}}</router-link>
              <router-link v-if="taskData.permissions.action_0"  :to="taskData.api_url+'/details/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-camera"></i> {{labels.get('label_details')}}</router-link>
            </div>
          </td>
          <template v-for="(column,key) in taskData.columns.all">
            <td :class="((['id','quantity','unit_price','amount'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
              <template v-if="(['month'].indexOf(key) != -1)">
                {{labels.get('label_month_short_'+item[key])}}
              </template>
              <template  v-else>{{ item[key] }}</template>

            </td>
          </template>

        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup> 

    import systemFunctions from "@/assets/systemFunctions";

    import labels from '@/labels'  
    import { inject,ref } from 'vue'
    import {useRouter} from 'vue-router';

    import ColumnControl from '@/components/ColumnControl.vue';
    import ColumnSort from '@/components/ColumnSort.vue';
    import ColumnFilter from '@/components/ColumnFilter.vue';
    import Pagination from '@/components/Pagination.vue';
    import globalVariables from "@/assets/globalVariables";
    import axios from "axios";
    import toastFunctions from "@/assets/toastFunctions";


    const router =useRouter()
    let taskData = inject('taskData')
    let show_column_controls=ref(false)
    for (let i in taskData.seasons){
      if(taskData.seasons[i]['month_'+globalVariables.current_month]==1){
        taskData.season_id=taskData.seasons[i].id;
        break;
      }
    }
    const setColumns=()=>{
      let columns={}
      let key='part_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:taskData.location_parts.map((item)=>{ return {value:item.name,label:item.name}}),}
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
      key='name';
      columns[key]={
        label: labels.get('label_territory_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };

      key='total_type_entered';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:false,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      key='total_type_competitor';
      columns[key]={
        label: '# Total Types has Competitor',
        hideable:true,
        filterable:false,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      key='total_type_arm';
      columns[key]={
        label: '# Total Types has ARM Variety',
        hideable:true,
        filterable:false,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      taskData.columns.all=columns
    }
    setColumns();
    $(document).ready(function()
    {
      $(document).off("change", "#fiscal_year");
      $(document).on("change",'#fiscal_year',async function()
      {
        console.log('called fiscal_year')
        taskData.reloadItems();
      })
      $(document).off("change", "#season_id");
      $(document).on("change",'#season_id',async function()
      {
        console.log('called season_id')
        taskData.reloadItems();
      })
      taskData.reloadItems();//For first time dropdown
    })
</script>

