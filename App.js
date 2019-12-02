import React,{Component}from 'react';
import 'antd/dist/antd.css';
import { Spin } from 'antd';
import './App.css';

import { Table, Input, Button, Popconfirm, Form, Result } from 'antd';

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(<Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;

    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Android',
        dataIndex: 'who',
        width: '30%',
        editable: true,
      },
      {
        title: 'desc',
        dataIndex: 'desc',
        editable: true,
      },
      {
        title: 'url',
        dataIndex: 'url',
        render: text => <a href={text} target='_blank'>{text}</a>,
        ellipsis: true,
      },
      {
        title: 'time',
        dataIndex: 'publishedAt',
        editable: true,
      },
      {
        title: 'source',
        dataIndex: 'source',
        editable: true,
      },
      {
        title: 'type',
        dataIndex: 'type',
        editable: true,
      },

      {
        title: '删除',
        dataIndex: 'operation',
        render: (text, record) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="确认删除该项吗?" onConfirm={() => this.handleDelete(record._id)}>
              <a>删除</a>
            </Popconfirm>
          ) : null,
      },
    ];

    this.state = {
      dataSource: null,
      count: 2,
    };  
    this.getData = this.getData.bind(this)
    this.changeData = this.changeData.bind(this)

  }
  
  changeData (result) {
    let results = result.results
    //results对象中的键`
    let arr = [];
    for(let i in results){
      arr.push(results[i])
    }

    let arr2 = [].concat.apply([],arr);
    this.setState({dataSource:arr2})
  }

  getData (){
    fetch ('https://gank.io/api/today')
    .then (response => response.json())
    .then (result => this.changeData (result))
  }


  componentDidMount () {
    this.getData ()
  }

  handleDelete = _id => {
    const dataSource = [...this.state.dataSource];
    this.setState({ dataSource: dataSource.filter(item => item._id !== _id) });
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      id:count+1,
      who:"可编辑",
      desc:"可编辑",
      url:"可编辑",
      time:"可编辑",
      source:"可编辑",
      type:"可编辑",
      
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
  };

  handleSave = row => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };

  render() {
    const { dataSource,data} = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    //最终渲染
    return (
      <div>
        {dataSource
            ?<div>{/* 数据 */}
                <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
                  Add a row
                </Button>
                <Table
                  components={components}
                  rowClassName={() => 'editable-row'}
                  bordered
                  dataSource={dataSource}
                  columns={columns}
                />
              </div>
              //加载中
            :<Spin style={{margin:"10px auto"}}/>
        }
    </div>
    );
  }
}

export default EditableTable