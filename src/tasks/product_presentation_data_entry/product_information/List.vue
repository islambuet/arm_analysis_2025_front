<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <form id="formListSearch">
        <div class="row">
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_part_name')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="list_search_part_id" class="form-control" name="options[part_id]">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_area_name')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="list_search_area_id" class="form-control" name="options[area_id]">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_territory_name')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="list_search_territory_id" class="form-control" name="options[territory_id]">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-2">
            <div class="row">
              <div class="col-4">
                <label class="font-weight-bold float-right">{{labels.get('label_upazila_id')}}</label>
              </div>
              <div class="col-8">
                <div class="input-group">
                  <select id="list_search_upazila_id" class="form-control" name="options[upazila_id]">
                    <option value="">{{labels.get('label_select')}}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="card d-print-none mb-2">
      <div class="card-body">
          <router-link v-if="taskData.permissions.action_1"  :to="taskData.api_url+'/add'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-plus-circle"></i> {{labels.get('action_1')}}/{{labels.get('label_edit')}}</router-link>
          <button type="button" v-if="taskData.permissions.action_4" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
          <button type="button" v-if="taskData.permissions.action_5" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="exportCsv"><i class="feather icon-download"></i> {{labels.get('action_5')}}</button>
          <button type="button" v-if="taskData.permissions.action_8" class="mr-2 mb-2 btn btn-sm" :class="[show_column_controls?'bg-gradient-success':'bg-gradient-primary']" @click="show_column_controls = !show_column_controls"><i class="feather icon-command"></i> {{labels.get('action_8')}}</button>
          <button type="button" v-if="taskData.permissions.action_0" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="taskData.reloadItems(taskData.pagination)"><i class="feather icon-rotate-cw"></i> {{labels.get('label_search')}}</button>
      </div>
  </div>
  <ColumnControl :url="taskData.api_url.substring(1)" :columns="taskData.columns"  v-if="show_column_controls"/>
  <div class="card mb-2">
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body" style='overflow-x:auto;min-height:250px;'>
      <table id="table_list" class="table table-bordered">
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
              <router-link v-if="taskData.permissions.action_0"  :to="taskData.api_url+'/details/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-camera"></i> {{labels.get('label_details')}}</router-link>
              <router-link v-if="taskData.permissions.action_2"  :to="taskData.api_url+'/edit/'+item.id" class="dropdown-item text-info btn-sm" ><i class="feather icon-edit"></i> {{labels.get('label_edit')}}</router-link>
            </div>
          </td>
          <template v-for="(column,key) in taskData.columns.all">
            <td :class="((['id','ordering','initial_plants'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):'col_9')" v-if="taskData.columns.hidden.indexOf(key)<0" :key="'td_'+key">
              {{ item[key] }}
            </td>
          </template>

        </tr>
        </tbody>
      </table>
      <Pagination :items = "taskData.items" :onChangePageOption="taskData.reloadItems" :pagination="taskData.pagination"/>
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


    const router =useRouter()
    let taskData = inject('taskData')
    let show_column_controls=ref(false)
    const exportCsv=async ()=>{
      systemFunctions.exportCsvFromHtmlTable('#table_list',labels.get('label_task'))
    }

    const setColumns=()=>{
      let columns={}
      let key='id';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'number',
        filter:{from:'',to:''},
        class:'col_1'
      };
      key='part_name';
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
      key='territory_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='district_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='upazila_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='crop_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'dropdown',
        filter:{from:'',to:'',options:taskData.crops.map((item)=>{ return {value:item.name,label:item.name}}),}
      };
      key='crop_type_name';
      columns[key]={
        label: labels.get('label_'+key),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='variety_name_arm';
      columns[key]={
        label: 'ARM '+labels.get('label_variety_name'),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='competitor_name';
      columns[key]={
        label: 'Competitor',
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };
      key='variety_name_competitor';
      columns[key]={
        label: 'Competitor '+labels.get('label_variety_name'),
        hideable:true,
        filterable:true,
        sortable:true,
        type:'text',
        filter:{from:'',to:''}
      };

      taskData.columns.all=columns
    }
    setColumns();
    $(document).ready(async function()
    {
      if(taskData.user_locations.part_id>0)
      {
        $('#list_search_part_id').html('<option value="'+taskData.user_locations.part_id+'">'+taskData.location_parts.find(temp=>temp.id==taskData.user_locations.part_id)?.name+'</option>');
        if(taskData.user_locations.area_id>0)
        {
          $('#list_search_area_id').html('<option value="'+taskData.user_locations.area_id+'">'+taskData.location_areas.find(temp=>temp.id==taskData.user_locations.area_id)?.name+'</option>');
          if(taskData.user_locations.territory_id>0)
          {
            $('#list_search_territory_id').html('<option value="'+taskData.user_locations.territory_id+'">'+taskData.location_territories.find(temp=>temp.id==taskData.user_locations.territory_id)?.name+'</option>');
            $('#list_search_upazila_id').html(taskData.getUpazilaDropdownHtml(taskData.user_locations.territory_id));
          }
          else{
            $('#list_search_territory_id').html(taskData.getTerritoryDropdownHtml(taskData.user_locations.area_id));
          }
        }
        else{
          $('#list_search_area_id').html(taskData.getAreaDropdownHtml(taskData.user_locations.part_id));
        }
      }
      else{
        $('#list_search_part_id').html(taskData.getPartDropdownHtml());
      }
      $(document).off("change", "#list_search_part_id");
      $(document).on("change", '#list_search_part_id', async function () {
        let location_id = $(this).val();
        $('#list_search_upazila_id').html('<option value="">'+labels.get('label_select')+'</option>');
        $('#list_search_territory_id').html('<option value="">'+labels.get('label_select')+'</option>');
        $('#list_search_area_id').html(taskData.getAreaDropdownHtml(location_id));
      })
      $(document).off("change", "#list_search_area_id");
      $(document).on("change", '#list_search_area_id', async function () {
        let location_id = $(this).val();
        $('#list_search_upazila_id').html('<option value="">'+labels.get('label_select')+'</option>');
        $('#list_search_territory_id').html(taskData.getTerritoryDropdownHtml(location_id));
      })
      $(document).off("change", "#list_search_territory_id");
      $(document).on("change", '#list_search_territory_id', async function () {
        let location_id = $(this).val();
        $('#list_search_upazila_id').html(taskData.getUpazilaDropdownHtml(location_id));
      })

      taskData.reloadItems(taskData.pagination)
    })
</script>

