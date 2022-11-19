import React, { useEffect, useState } from "react";

// Import Components
import {
  Button,
  Popconfirm,
  Space,
  Table,
  Typography,
  Form,
  Input,
  InputNumber,
} from "antd";

// Import Actions & Methods
import { getPosts, deletePost, updatePost } from "../redux/actions/postActions";
import { useDispatch, useSelector } from "react-redux";

// Import Constants
const { Title } = Typography;

// Table Styles
const TableStyle = {
  paddingLeft: 20,
  paddingRight: 20,
};

const DataTable = () => {
  const dispatch = useDispatch();
  // Table States
  const [dataSource, setDataSource] = useState([]);
  const [isFetched, setIsFetched] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});

  // Form States
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState("");
  const isEditing = (record) => record.key === editingKey;

  // Get Posts
  useEffect(() => {
    dispatch(getPosts());
  }, []);

  // Get Data From Redux Store
  const { posts, loading, isSuccess } = useSelector((state) => state.posts);

  // On Cancel
  const _onCancel = () => {
    setEditingKey("");
  };

  // On Save
  const _onSave = async (record) => {
    try {
      const row = await form.validateFields();
      // Handle Update
      dispatch(updatePost({ id: record.id, ...row }));
      if (isSuccess) {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => record.key === item.key);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          setDataSource(newData);
          setEditingKey("");
        } else {
          newData.push(row);
          setDataSource(newData);
          setEditingKey("");
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // On Edit
  const _onEdit = (record) => {
    form.setFieldsValue({
      ...record,
      title: record.title,
      body: record.body,
      age: record.age,
    });
    setEditingKey(record.key);
  };

  // On Reset
  const _onReset = () => {
    setSortedInfo({});
  };

  // Handle Delete
  const _handleDelete = (record) => {
    dispatch(deletePost(record.id));
    if (isSuccess) {
      setDataSource(dataSource.filter((data) => data.id !== record.id));
    }
  };

  // Handle On Change
  const _handleChange = (...sorter) => {
    const { order, field } = sorter[2];
    setSortedInfo({ columnKey: field, order });
  };

  // Set Table Data Source
  if (posts.length > 0 && !isFetched) {
    posts.forEach((post, index) => {
      setDataSource((prev) => [
        ...prev,
        {
          key: post.id,
          ID: index + 1,
          age: Math.floor(Math.random() * 99) + 1,
          ...post,
        },
      ]);
    });
    setIsFetched(true);
  }

  // Set Table Columns
  const columns = [
    { key: 1, title: "ID", dataIndex: "ID" },
    {
      key: 2,
      title: "Title",
      dataIndex: "title",
      editable: true,
      sorter: (a, b) => a.title.length - b.title.length,
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
    },
    {
      key: 3,
      title: "Message",
      dataIndex: "body",
      editable: true,
      sorter: (a, b) => a.body.length - b.body.length,
      sortOrder: sortedInfo.columnKey === "body" ? sortedInfo.order : null,
    },
    {
      key: 4,
      title: "Age",
      dataIndex: "age",
      align: "center",
      editable: true,
      sorter: (a, b) => a.age - b.age,
      sortOrder: sortedInfo.columnKey === "age" ? sortedInfo.order : null,
    },
    {
      key: 5,
      title: "Actions",
      dataIndex: "",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return (
          <>
            {editable ? (
              <Space>
                <Button onClick={() => _onSave(record)}>Save</Button>
                <Popconfirm
                  title="Are you sue to cancel?"
                  onConfirm={_onCancel}
                >
                  <Button danger>Cancel</Button>
                </Popconfirm>
              </Space>
            ) : (
              <Space>
                <Button onClick={() => _onEdit(record)} type="primary">
                  Edit
                </Button>
                <Popconfirm
                  title="Are you sure want to delete?"
                  onConfirm={() => _handleDelete(record)}
                >
                  <Button danger type="primary">
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </>
        );
      },
    },
  ];

  // Set Editable Row
  const _mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === "age" ? "number" : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // Set Editable Cell
  const _EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === "number" ? <InputNumber /> : <Input />;

    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };
  return (
    <div>
      <Title level={2}>DataTable</Title>
      <Space
        style={{
          marginBottom: 16,
        }}
      >
        <Button onClick={_onReset}>Reset</Button>
        {/* <Button onClick={clearFilters}>Clear filters</Button> */}
        {/* <Button onClick={clearAll}>Clear filters and sorters</Button> */}
      </Space>
      <Form form={form} component={false}>
        <Table
          components={{
            body: {
              cell: _EditableCell,
            },
          }}
          columns={_mergedColumns}
          dataSource={dataSource}
          style={TableStyle}
          bordered
          loading={loading}
          pagination={{
            position: ["bottomCenter"],
          }}
          onChange={_handleChange}
        ></Table>
      </Form>
    </div>
  );
};

export default DataTable;
