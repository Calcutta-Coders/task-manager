import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';

const statusMap: any = {
  Pending: { label: 'Pending', color: 'warning' },
  // delivered: { label: 'Complete', color: 'success' },
  'To do': { label: 'To do', color: 'error' },
} as const;

export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: 'Pending' | 'To do' | 'Completed';
  createdAt: Date;
}

// export interface LatestOrdersProps {
//   orders?: Order[];
//   sx?: SxProps;
// }

export function LatestOrders({ orders = [], sx }: any): React.JSX.Element {
  const router = useRouter();
  return (
    <Card sx={sx}>
      <CardHeader title="My pending tasks" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Task</TableCell>
              <TableCell sortDirection="desc">Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order: any) => {
              const { label, color } = statusMap[order.status] ?? { label: 'Unknown', color: 'default' };

              return (
                <TableRow
                  hover
                  key={order._id}
                  onClick={() => {
                    router.replace(`/dashboard/customer/${order.client._id}`);
                  }}
                >
                  <TableCell>{order.client.name}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{dayjs(order.dueDate).format('YYYY-MM-DD')}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      {/* <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
          variant="text"
        >
          View all
        </Button>
      </CardActions> */}
    </Card>
  );
}
